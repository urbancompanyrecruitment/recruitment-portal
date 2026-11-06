import dayjs from 'dayjs';
import { SLOT_CAPACITY } from '@/domain/constant';
import {
  CookingFrequency,
  ImportRowOutcome,
  InactiveReason,
  LockState,
  RecruitmentSource,
  ReservationEventType,
  YesNo,
} from '@/domain/interface';
import { readDb, writeDb } from '@/mocks/db';
import { signInPartner, signInRecruiter } from './auth';
import { importVerifiedCandidates, listCandidates, registerCandidate, updateSingaporePhone } from './candidates';
import { API_ERROR } from './constant';
import { RegistrationInput } from './interface';
import { createRecruiter, toggleRecruiterAccess, updateAggregatorQuota } from './people';
import {
  expireUnassignedReservations,
  getReservedCandidate,
  listAvailableCandidates,
  listMyReservations,
  reserveCandidate,
  runLockCleanup,
  savePlacement,
  updateHub,
} from './reservations';
import { listBookableSlotsFor } from './slots';

const registration: RegistrationInput = {
  name: 'Test Partner',
  primaryPhone: '+95 9999 1234',
  password: 'Partner123!',
  country: 'Myanmar',
  city: 'Yangon',
  nationality: 'Myanmar',
  age: 30,
  source: RecruitmentSource.TikTok,
  comfortableWithDogs: YesNo.Yes,
  cookingFrequency: CookingFrequency.Daily,
  deepCleaningExperience: YesNo.No,
  consent: true,
  interviewCity: 'tampines',
};

const inDays = (days: number) => dayjs().add(days, 'day').format('YYYY-MM-DD');

describe('candidates api', () => {
  it('registers a partner without a Singapore number and creates no lead', async () => {
    const [firstSlot] = await listBookableSlotsFor('tampines');
    const { candidate, slot } = await registerCandidate({ ...registration, slotId: firstSlot.id });

    expect(candidate).toMatchObject({ name: 'Test Partner', verified: false, primaryPhone: '+95 9999 1234' });
    expect(candidate).not.toHaveProperty('password');
    expect(candidate.singaporePhone).toBeUndefined();
    expect(candidate.onboarding).toBeUndefined();
    expect(slot?.id).toBe(firstSlot.id);
  });

  it('gives the number to the first sign-up and lets only that partner sign in with their password', async () => {
    const { candidate } = await registerCandidate(registration);

    await expect(registerCandidate({ ...registration, password: 'Another123!' })).rejects.toThrow(API_ERROR.duplicatePhone);

    const session = await signInPartner('+95-9999-1234', 'Partner123!');

    expect(session).toMatchObject({ id: candidate.id, name: 'Test Partner', subtitle: '+95 9999 1234' });
    await expect(signInPartner('+95 9999 1234', 'Another123!')).rejects.toThrow(API_ERROR.invalidPartnerCredentials);
    await expect(signInPartner('+95 9999 0000', 'Partner123!')).rejects.toThrow(API_ERROR.invalidPartnerCredentials);
  });

  it('registers a partner with a Singapore number and creates the lead', async () => {
    const { candidate } = await registerCandidate({ ...registration, singaporePhone: '+65 9123 4567' });

    expect(candidate.singaporePhone).toBe('+65 9123 4567');
    expect(candidate.onboarding?.leadId).toMatch(/^lead-/);
    expect(candidate.onboarding?.approvedAt).toBeUndefined();
  });

  it('rejects an invalid Singapore number', async () => {
    await expect(registerCandidate({ ...registration, singaporePhone: '+65 1234' })).rejects.toThrow(
      API_ERROR.invalidSingaporePhone,
    );
  });

  it('rejects a duplicate primary number regardless of formatting', async () => {
    await expect(registerCandidate({ ...registration, primaryPhone: '+6590000001' })).rejects.toThrow(
      API_ERROR.duplicatePhone,
    );
  });

  it('rejects past, unknown and full slots', async () => {
    const [firstSlot] = await listBookableSlotsFor('tampines');

    await expect(registerCandidate({ ...registration, slotId: 'tampines_2020-01-01_09:00' })).rejects.toThrow(
      API_ERROR.slotUnavailable,
    );
    await expect(registerCandidate({ ...registration, interviewCity: 'nowhere' })).rejects.toThrow(API_ERROR.unknownCity);

    await Array.from({ length: SLOT_CAPACITY }, (_, index) => index).reduce<Promise<unknown>>(
      (chain, index) =>
        chain.then(() => registerCandidate({ ...registration, primaryPhone: `+95 9999 00${index}`, slotId: firstSlot.id })),
      Promise.resolve(),
    );

    await expect(registerCandidate({ ...registration, primaryPhone: '+95 9999 5678', slotId: firstSlot.id })).rejects.toThrow(
      API_ERROR.slotUnavailable,
    );
  }, 20000);

  it('lists every seeded candidate for the business team', async () => {
    const candidates = await listCandidates();

    expect(candidates).toHaveLength(15);
    expect(candidates.map(candidate => candidate.name)).toContain('May Thu');
  });

  it('creates the lead once when an admin adds a Singapore number', async () => {
    const added = await updateSingaporePhone('c8', '+65 9123 0008');
    const updated = await updateSingaporePhone('c8', '+65 9123 0009');

    expect(added.onboarding?.leadId).toMatch(/^lead-/);
    expect(updated.onboarding?.leadId).toBe(added.onboarding?.leadId);
    expect(updated.singaporePhone).toBe('+65 9123 0009');
    await expect(updateSingaporePhone('c9', '12345')).rejects.toThrow(API_ERROR.invalidSingaporePhone);
  });

  it('verifies and approves only rows with a Singapore number on file', async () => {
    const result = await importVerifiedCandidates(
      ['+65 9000 0012', '+66 9000 0008', '+65 9000 0001', '+65 0000 0000', '', '+65 9000 0012'],
      'verified.csv',
    );

    expect(result.counts).toEqual({ rows: 6, accepted: 1, failed: 5 });
    expect(result.rows.map(row => row.outcome)).toEqual([
      ImportRowOutcome.Accepted,
      ImportRowOutcome.NoSingaporeNumber,
      ImportRowOutcome.AlreadyVerified,
      ImportRowOutcome.NotFound,
      ImportRowOutcome.InvalidPhone,
      ImportRowOutcome.DuplicateInFile,
    ]);
    const approved = readDb().candidates.find(candidate => candidate.id === 'c12');
    expect(approved).toMatchObject({ verified: true });
    expect(approved?.onboarding?.approvedAt).toBeTruthy();
    expect(readDb().candidates.find(candidate => candidate.id === 'c8')?.verified).toBe(false);
  });
});

describe('reservations api', () => {
  it('lists only verified candidates without an active lock or placement, and no numbers', async () => {
    const available = await listAvailableCandidates();
    const names = available.map(candidate => candidate.name);

    expect(names).toEqual(expect.arrayContaining(['Thandar Aung', 'Siti Rahma', 'Hnin Wai']));
    expect(names).not.toContain('Ana Reyes');
    expect(names).not.toContain('Nwe Nwe Yi');
    expect(names).not.toContain('Mira Santos');
    expect(available[0]).not.toHaveProperty('primaryPhone');
  });

  it('locks a profile exclusively for the first recruiter with a release time', async () => {
    const lock = await reserveCandidate('c1', 'r-a');

    expect(lock).toMatchObject({ state: LockState.Active, recruiterId: 'r-a' });
    expect(lock.lockReleaseAt).toBeGreaterThan(lock.lockedAt);
    await expect(reserveCandidate('c1', 'r-b')).rejects.toThrow(API_ERROR.reservedByOther);
    await expect(getReservedCandidate('c1', 'r-b')).rejects.toThrow(API_ERROR.reservationNotFound);
    expect((await getReservedCandidate('c1', 'r-a')).candidate.primaryPhone).toBe('+65 9000 0001');
    expect((await listAvailableCandidates()).map(candidate => candidate.id)).not.toContain('c1');
    expect(readDb().reservationEvents.at(-1)).toMatchObject({ type: ReservationEventType.Opened, candidateId: 'c1' });
  });

  it('refuses to lock unverified candidates', async () => {
    await expect(reserveCandidate('c8', 'r-a')).rejects.toThrow(API_ERROR.profileUnavailable);
  });

  it('saves a placement only with a known aggregator and a future date, then marks the lock placed', async () => {
    await expect(savePlacement('c6', 'r-a', { startDate: inDays(-1), aggregatorId: 'ag-1' })).rejects.toThrow(
      API_ERROR.invalidPlacement,
    );
    await expect(savePlacement('c6', 'r-a', { startDate: inDays(20), aggregatorId: 'nope' })).rejects.toThrow(
      API_ERROR.invalidPlacement,
    );

    const saved = await savePlacement('c6', 'r-a', { startDate: inDays(20), aggregatorId: 'ag-3' });

    expect(saved).toMatchObject({
      aggregatorId: 'ag-3',
      startDate: inDays(20),
      state: LockState.Inactive,
      inactiveReason: InactiveReason.Placed,
    });
  });

  it('releases expired locks back to the pool and lets another recruiter lock', async () => {
    const released = await expireUnassignedReservations('r-a');
    const mine = await listMyReservations('r-a');

    expect(released).toBe(1);
    expect(mine.find(item => item.candidate.id === 'c6')?.reservation).toMatchObject({
      state: LockState.Inactive,
      inactiveReason: InactiveReason.Expired,
    });
    expect((await listAvailableCandidates()).map(candidate => candidate.id)).toContain('c6');
    expect(readDb().reservationEvents.at(-1)).toMatchObject({ type: ReservationEventType.Expired, candidateId: 'c6' });
    await expect(getReservedCandidate('c6', 'r-a')).rejects.toThrow(API_ERROR.lockExpired);

    const relocked = await reserveCandidate('c6', 'r-b');

    expect(relocked).toMatchObject({ recruiterId: 'r-b', state: LockState.Active });
  });

  it('marks locks whose release time has passed as inactive in the daily cleanup', async () => {
    const db = readDb();
    writeDb({
      ...db,
      reservations: db.reservations.map(reservation =>
        reservation.candidateId === 'c7' ? { ...reservation, lockReleaseAt: Date.now() - 1 } : reservation,
      ),
    });

    const count = await runLockCleanup();

    expect(count).toBe(1);
    expect(readDb().reservations.find(reservation => reservation.candidateId === 'c7')).toMatchObject({
      state: LockState.Inactive,
      inactiveReason: InactiveReason.Expired,
    });
    expect((await listAvailableCandidates()).map(candidate => candidate.id)).toContain('c7');
  });

  it('lets the business team update the hub on a placement', async () => {
    const updated = await updateHub('c2', {
      hub: 'Jurong East · West cluster',
      startDate: inDays(12),
      hubInstructions: 'Stay in the West cluster.',
    });

    expect(updated).toMatchObject({ hub: 'Jurong East · West cluster', recruiterId: 'r-a' });
  });
});

describe('slots and people api', () => {
  it('offers hourly future slots with seats left for a city', async () => {
    const slots = await listBookableSlotsFor('bedok');

    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every(slot => slot.cityKey === 'bedok' && slot.seatsLeft <= SLOT_CAPACITY)).toBe(true);
    expect(slots.every(slot => dayjs(`${slot.date}T${slot.time}`).isAfter(dayjs()))).toBe(true);
  });

  it('signs recruiters in with the demo password and trims the login id', async () => {
    const user = await signInRecruiter(' recruiter.a ', 'Demo123!');

    expect(user).toMatchObject({ id: 'r-a', name: 'Alex Morgan', subtitle: 'BrightPath Recruitment' });
    await expect(signInRecruiter('recruiter.a', 'wrong')).rejects.toThrow(API_ERROR.invalidCredentials);
  });

  it('blocks suspended recruiters from signing in', async () => {
    await toggleRecruiterAccess('r-b');

    await expect(signInRecruiter('recruiter.b', 'Demo123!')).rejects.toThrow(API_ERROR.invalidCredentials);
  });

  it('rejects duplicate recruiter logins and negative quotas', async () => {
    await expect(createRecruiter({ name: 'X', company: 'Y', loginId: 'recruiter.a' })).rejects.toThrow(
      API_ERROR.duplicateLogin,
    );
    await expect(updateAggregatorQuota('ag-1', -1)).rejects.toThrow(API_ERROR.invalidQuota);
    expect(await updateAggregatorQuota('ag-1', 15)).toMatchObject({ quota: 15 });
  });
});
