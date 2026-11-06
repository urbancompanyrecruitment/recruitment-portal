import dayjs from 'dayjs';
import { createSeedDb } from '@/mocks/seed';
import { LOCK_EXPIRED_LABEL, SINGAPORE_INTERVIEW_CITIES, SLOT_CAPACITY } from './constant';
import { buildChannelFunnel } from './funnel';
import { InactiveReason, LockState, RecruitmentSource, ReservationStatus } from './interface';
import { isSingaporePhone, isValidSingaporePhone, phoneDigits } from './phone';
import {
  blocksAvailability,
  formatLockStatus,
  formatTimeLeft,
  getReservationStatus,
  isJoiningWithinNoticeWindow,
  isLockActive,
  isLockExpired,
} from './reservation';
import { countSlotBookings, formatSlot, generateSlots, listBookableSlots, parseSlotId } from './slot';
import { getInitials } from './format';

const now = dayjs('2026-10-27T10:00:00');
const seed = createSeedDb(now);
const today = now.format('YYYY-MM-DD');

describe('lock rules', () => {
  const active = { candidateId: 'c1', recruiterId: 'r-a', lockedAt: 0, lockReleaseAt: 1000, state: LockState.Active };
  const inactive = { ...active, state: LockState.Inactive, inactiveReason: InactiveReason.Expired, inactiveAt: 1000 };

  it('treats a lock as active only until its release time', () => {
    expect(isLockActive(active, 999)).toBe(true);
    expect(isLockActive(active, 1000)).toBe(false);
    expect(isLockActive(inactive, 0)).toBe(false);
  });

  it('flags active locks past their release time for the daily cleanup', () => {
    expect(isLockExpired(active, 999)).toBe(false);
    expect(isLockExpired(active, 1000)).toBe(true);
    expect(isLockExpired(inactive, 5000)).toBe(false);
  });

  it('keeps placed partners and actively locked partners out of the pool', () => {
    expect(blocksAvailability(active, 500)).toBe(true);
    expect(blocksAvailability(active, 5000)).toBe(false);
    expect(blocksAvailability({ ...inactive, aggregatorId: 'ag-1' }, 5000)).toBe(true);
  });

  it('reports status from aggregator assignment', () => {
    expect(getReservationStatus(active)).toBe(ReservationStatus.AwaitingAggregator);
    expect(getReservationStatus({ ...active, aggregatorId: 'ag-1' })).toBe(ReservationStatus.AggregatorAssigned);
  });

  it('formats time left and the expired state', () => {
    expect(formatTimeLeft(125 * 60000, 0)).toBe('2h 5m left');
    expect(formatTimeLeft(45 * 60000, 0)).toBe('45m left');
    expect(formatLockStatus({ ...active, lockReleaseAt: 45 * 60000 }, 0)).toBe('45m left');
    expect(formatLockStatus(active, 1000)).toBe(LOCK_EXPIRED_LABEL);
    expect(formatLockStatus(inactive, 0)).toBe(LOCK_EXPIRED_LABEL);
  });

  it('flags placements joining within two weeks', () => {
    const placed = { ...inactive, inactiveReason: InactiveReason.Placed, aggregatorId: 'ag-1' };

    expect(isJoiningWithinNoticeWindow({ ...placed, startDate: '2026-11-05' }, today)).toBe(true);
    expect(isJoiningWithinNoticeWindow({ ...placed, startDate: '2026-11-20' }, today)).toBe(false);
    expect(isJoiningWithinNoticeWindow({ ...active, startDate: '2026-11-05' }, today)).toBe(false);
  });
});

describe('phone rules', () => {
  it('normalises digits and recognises Singapore numbers', () => {
    expect(phoneDigits('+65 9123-4567')).toBe('6591234567');
    expect(isSingaporePhone('+65 9123 4567')).toBe(true);
    expect(isSingaporePhone('+95 9123 4567')).toBe(false);
    expect(isValidSingaporePhone('+65 9123 4567')).toBe(true);
    expect(isValidSingaporePhone('+6581234567')).toBe(true);
    expect(isValidSingaporePhone('+65 1234 5678')).toBe(false);
    expect(isValidSingaporePhone('+95 9123 4567')).toBe(false);
  });
});

describe('slot rules', () => {
  it('generates hourly slots per city for today and the next two days, future starts only', () => {
    const slots = generateSlots(now);
    const tampines = slots.filter(slot => slot.cityKey === 'tampines');

    expect(slots).toHaveLength(SINGAPORE_INTERVIEW_CITIES.length * (7 + 10 + 10));
    expect(tampines.map(slot => slot.date + ' ' + slot.time).slice(0, 2)).toEqual(['2026-10-27 11:00', '2026-10-27 12:00']);
    expect(tampines.at(-1)).toMatchObject({ date: '2026-10-29', time: '17:00', capacity: SLOT_CAPACITY });
    expect(tampines[0].id).toBe('tampines_2026-10-27_11:00');
  });

  it('counts bookings per slot and hides full slots', () => {
    const slotId = 'tampines_2026-10-28_09:00';
    const booked = Array.from({ length: SLOT_CAPACITY }, (_, index) => ({ ...seed.candidates[0], id: `b${index}`, slotId }));

    expect(countSlotBookings(booked, slotId)).toBe(SLOT_CAPACITY);
    expect(listBookableSlots('tampines', booked, now).map(slot => slot.id)).not.toContain(slotId);
    expect(listBookableSlots('tampines', seed.candidates, now).map(slot => slot.id)).toContain(slotId);
    expect(listBookableSlots('nowhere', seed.candidates, now)).toEqual([]);
  });

  it('parses and formats slot ids', () => {
    const slot = parseSlotId('bedok_2026-10-30_14:00')!;

    expect(slot).toMatchObject({ cityKey: 'bedok', date: '2026-10-30', time: '14:00' });
    expect(formatSlot(slot)).toBe('Fri, 30 Oct 2026 · 14:00 · Asia/Singapore');
    expect(parseSlotId('broken')).toBeUndefined();
  });
});

describe('channel funnel', () => {
  it('builds weekly conversion by channel for the signup cohort', () => {
    const rows = buildChannelFunnel(seed.candidates, seed.reservations, now.subtract(6, 'day').format('YYYY-MM-DD'));
    const tiktok = rows.find(row => row.source === RecruitmentSource.TikTok)!;

    expect(tiktok).toEqual({
      source: RecruitmentSource.TikTok,
      signups: 4,
      withSingaporePhone: 2,
      verified: 1,
      placed: 1,
      conversion: 25,
    });
  });

  it('excludes signups outside the week', () => {
    expect(buildChannelFunnel(seed.candidates, seed.reservations, now.subtract(30, 'day').format('YYYY-MM-DD'))).toEqual([]);
  });
});

describe('format helpers', () => {
  it('builds initials from the first two names', () => {
    expect(getInitials('Nwe Nwe Yi')).toBe('NN');
    expect(getInitials('ana reyes')).toBe('AR');
  });
});
