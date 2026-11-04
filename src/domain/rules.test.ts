import dayjs from 'dayjs';
import { createSeedDb } from '@/mocks/seed';
import { LOCK_EXPIRED_LABEL } from './constant';
import { buildChannelFunnel } from './funnel';
import { Geography, InactiveReason, LockState, RecruitmentSource, ReservationStatus } from './interface';
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
import { countSlotBookings, formatSlot, listBookableSlots } from './slot';
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
  it('counts bookings per slot', () => {
    expect(countSlotBookings(seed.candidates, 's7')).toBe(1);
  });

  it('lists only open, future, non-full slots for the geography in time order', () => {
    const singapore = listBookableSlots(seed.slots, seed.candidates, Geography.Singapore, today);

    expect(singapore.map(slot => slot.id)).toEqual(['s7', 's1', 's2']);
    expect(listBookableSlots(seed.slots, seed.candidates, Geography.Myanmar, today).map(slot => slot.id)).toEqual(['s3']);
  });

  it('hides full and closed slots', () => {
    const fullSlot = seed.slots.map(slot => (slot.id === 's7' ? { ...slot, capacity: 1 } : slot));
    const closedSlot = seed.slots.map(slot => (slot.id === 's1' ? { ...slot, isOpen: false } : slot));

    expect(listBookableSlots(fullSlot, seed.candidates, Geography.Singapore, today).map(slot => slot.id)).not.toContain('s7');
    expect(listBookableSlots(closedSlot, seed.candidates, Geography.Singapore, today).map(slot => slot.id)).not.toContain('s1');
  });

  it('formats a slot with day, time and time zone', () => {
    expect(formatSlot(seed.slots.find(slot => slot.id === 's1')!)).toBe('Fri, 30 Oct 2026 · 09:30 · Asia/Singapore');
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
