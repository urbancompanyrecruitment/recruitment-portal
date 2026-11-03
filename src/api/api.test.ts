import dayjs from 'dayjs';
import { CookingFrequency, Geography, RecruitmentSource, ReservationEventType, YesNo } from '@/domain/interface';
import { readDb } from '@/mocks/db';
import { signInRecruiter } from './auth';
import { getRegistration, listCandidates, markL1Completed, registerCandidate } from './candidates';
import { API_ERROR } from './constant';
import { RegistrationInput } from './interface';
import { createRecruiter, toggleRecruiterAccess, updateAggregatorQuota } from './people';
import {
  expireUnassignedReservations,
  getReservedCandidate,
  listAvailableCandidates,
  listMyReservations,
  reserveCandidate,
  savePlacement,
  updateHub,
} from './reservations';
import { createSlot, listBookableSlotsFor, toggleSlotAvailability } from './slots';

const registration: RegistrationInput = {
  name: 'Test Partner',
  phone: '+65 9999 1234',
  country: 'Singapore',
  city: 'Singapore',
  nationality: 'Myanmar',
  age: 30,
  source: RecruitmentSource.TikTok,
  comfortableWithDogs: YesNo.Yes,
  cookingFrequency: CookingFrequency.Daily,
  deepCleaningExperience: YesNo.No,
  consent: true,
  interviewGeography: Geography.Singapore,
  slotId: 's1',
};

const inDays = (days: number) => dayjs().add(days, 'day').format('YYYY-MM-DD');

describe('candidates api', () => {
  it('registers a partner with pending results and a queued invitation', async () => {
    const candidate = await registerCandidate(registration);
    const details = await getRegistration(candidate.id);

    expect(details.candidate).toMatchObject({ name: 'Test Partner', verified: false, invitationStatus: 'Queued' });
    expect(details.candidate.results).toEqual({ l1: 'Pending', l2: 'Pending', l3: 'Pending' });
    expect(details.slot?.id).toBe('s1');
  });

  it('rejects a duplicate WhatsApp number regardless of formatting', async () => {
    await expect(registerCandidate({ ...registration, phone: '+6500000001' })).rejects.toThrow(API_ERROR.duplicatePhone);
  });

  it('rejects a slot that is full', async () => {
    await registerCandidate({ ...registration, slotId: 's7' });

    await expect(registerCandidate({ ...registration, phone: '+65 9999 5678', slotId: 's7' })).rejects.toThrow(
      API_ERROR.slotUnavailable,
    );
  });

  it('lists every seeded candidate for the business team', async () => {
    const candidates = await listCandidates();

    expect(candidates).toHaveLength(15);
    expect(candidates.map(candidate => candidate.name)).toContain('May Thu');
  });

  it('marks the online L1 test as completed', async () => {
    const updated = await markL1Completed('c12');

    expect(updated).toMatchObject({ l1Completed: true, invitationStatus: 'Completed' });
  });
});

describe('reservations api', () => {
  it('lists only verified, unreserved candidates without contact details', async () => {
    const available = await listAvailableCandidates();
    const names = available.map(candidate => candidate.name);

    expect(names).toContain('Thandar Aung');
    expect(names).not.toContain('Ana Reyes');
    expect(names).not.toContain('Mira Santos');
    expect(available[0]).not.toHaveProperty('phone');
  });

  it('reserves a profile exclusively for the first recruiter', async () => {
    await reserveCandidate('c1', 'r-a');

    await expect(reserveCandidate('c1', 'r-b')).rejects.toThrow(API_ERROR.reservedByOther);
    await expect(getReservedCandidate('c1', 'r-b')).rejects.toThrow(API_ERROR.reservationNotFound);
    expect((await getReservedCandidate('c1', 'r-a')).candidate.phone).toBe('+65 0000 0001');
    expect((await listAvailableCandidates()).map(candidate => candidate.id)).not.toContain('c1');
    expect(readDb().reservationEvents.at(-1)).toMatchObject({ type: ReservationEventType.Opened, candidateId: 'c1' });
  });

  it('refuses to reserve unverified candidates', async () => {
    await expect(reserveCandidate('c8', 'r-a')).rejects.toThrow(API_ERROR.profileUnavailable);
  });

  it('saves a placement only with a known aggregator and a future date', async () => {
    await expect(savePlacement('c6', 'r-a', { startDate: inDays(-1), aggregatorId: 'ag-1' })).rejects.toThrow(
      API_ERROR.invalidPlacement,
    );
    await expect(savePlacement('c6', 'r-a', { startDate: inDays(20), aggregatorId: 'nope' })).rejects.toThrow(
      API_ERROR.invalidPlacement,
    );

    const saved = await savePlacement('c6', 'r-a', { startDate: inDays(20), aggregatorId: 'ag-3' });

    expect(saved).toMatchObject({ aggregatorId: 'ag-3', startDate: inDays(20) });
  });

  it('releases unassigned reservations back to the pool on expiry', async () => {
    const released = await expireUnassignedReservations('r-a');
    const mine = await listMyReservations('r-a');

    expect(released).toBe(1);
    expect(mine.map(item => item.candidate.id).sort()).toEqual(['c2', 'c5']);
    expect((await listAvailableCandidates()).map(candidate => candidate.id)).toContain('c6');
    expect(readDb().reservationEvents.at(-1)).toMatchObject({ type: ReservationEventType.Expired, candidateId: 'c6' });
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
  it('publishes a slot in the trainer geography and time zone', async () => {
    const slot = await createSlot({
      trainerId: 't-mm',
      date: inDays(7),
      time: '09:00',
      capacity: 5,
      centre: 'Yangon centre',
      address: 'Somewhere',
      instructions: 'Bring ID',
    });

    expect(slot).toMatchObject({ geography: Geography.Myanmar, timeZone: 'Asia/Yangon', isOpen: true });
    expect((await listBookableSlotsFor(Geography.Myanmar)).find(item => item.id === slot.id)?.seatsLeft).toBe(5);
  });

  it('rejects clashing or past sessions', async () => {
    const s1 = readDb().slots.find(slot => slot.id === 's1')!;
    const input = { trainerId: 't-sg', date: s1.date, time: s1.time, capacity: 4, centre: 'c', address: 'a', instructions: 'i' };

    await expect(createSlot(input)).rejects.toThrow(API_ERROR.duplicateSession);
    await expect(createSlot({ ...input, date: inDays(-1) })).rejects.toThrow(API_ERROR.invalidSlot);
  });

  it('hides closed slots from partner registration', async () => {
    await toggleSlotAvailability('s1');

    expect((await listBookableSlotsFor(Geography.Singapore)).map(slot => slot.id)).not.toContain('s1');
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
