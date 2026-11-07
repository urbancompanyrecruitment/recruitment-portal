import dayjs from 'dayjs';
import { ANA, CANDIDATES, THANDAR } from '@/test/fixtures';
import { LOCK_EXPIRED_LABEL } from './constant';
import { getInitials } from './format';
import { buildChannelFunnel } from './funnel';
import { InactiveReason, LockState, RecruitmentSource, ReservationStatus } from './interface';
import { isSingaporePhone, isValidSingaporePhone, phoneDigits } from './phone';
import { formatLockStatus, formatTimeLeft, getReservationStatus, isLockActive, isLockExpired, isPlaced } from './reservation';
import { findCity, formatSlot, parseSlotId } from './slot';

describe('lock rules', () => {
  const active = { id: 'l1', candidateId: 'c1', recruiterId: 'r-a', lockedAt: 0, lockReleaseAt: 1000, state: LockState.Active };
  const placed = { ...active, state: LockState.Inactive, inactiveReason: InactiveReason.Placed, employerName: 'X', startDate: '2026-12-01' };

  it('treats a lock as active only until its release time', () => {
    expect(isLockActive(active, 999)).toBe(true);
    expect(isLockActive(active, 1000)).toBe(false);
    expect(isLockExpired(active, 1000)).toBe(true);
    expect(isLockExpired(placed, 5000)).toBe(false);
  });

  it('derives the placement status from the inactive reason', () => {
    expect(isPlaced(placed)).toBe(true);
    expect(getReservationStatus(active)).toBe(ReservationStatus.AwaitingPlacement);
    expect(getReservationStatus(placed)).toBe(ReservationStatus.Placed);
  });

  it('formats time left and the expired state', () => {
    expect(formatTimeLeft(125 * 60000, 0)).toBe('2h 5m left');
    expect(formatLockStatus({ ...active, lockReleaseAt: 45 * 60000 }, 0)).toBe('45m left');
    expect(formatLockStatus(active, 1000)).toBe(LOCK_EXPIRED_LABEL);
  });
});

describe('phone rules', () => {
  it('normalises digits and recognises Singapore numbers', () => {
    expect(phoneDigits('+65 9123-4567')).toBe('6591234567');
    expect(isSingaporePhone('+65 9123 4567')).toBe(true);
    expect(isSingaporePhone('+95 9123 4567')).toBe(false);
    expect(isValidSingaporePhone('+65 9123 4567')).toBe(true);
    expect(isValidSingaporePhone('+65 1234 5678')).toBe(false);
  });
});

describe('slot helpers', () => {
  it('parses and formats slot ids and finds cities', () => {
    const slot = parseSlotId('bedok_2026-10-30_14:00')!;

    expect(slot).toMatchObject({ cityKey: 'bedok', date: '2026-10-30', time: '14:00' });
    expect(formatSlot(slot)).toBe('Fri, 30 Oct 2026 · 14:00 · Asia/Singapore');
    expect(parseSlotId('broken')).toBeUndefined();
    expect(findCity([{ key: 'bedok', name: 'Bedok', centre: '', address: '', instructions: '' }], 'bedok')?.name).toBe('Bedok');
  });
});

describe('channel funnel', () => {
  it('builds conversion by channel for the signup cohort', () => {
    const rows = buildChannelFunnel(CANDIDATES, dayjs(THANDAR.createdAt).subtract(1, 'day').format('YYYY-MM-DD'));
    const tiktok = rows.find(row => row.source === RecruitmentSource.TikTok)!;

    expect(tiktok.signups).toBeGreaterThanOrEqual(2);
    expect(tiktok.placed).toBe(1);
    expect(buildChannelFunnel([ANA], '2020-01-01')).toEqual([]);
  });
});

describe('format helpers', () => {
  it('builds initials from the first two names', () => {
    expect(getInitials('Nwe Nwe Yi')).toBe('NN');
    expect(getInitials('ana reyes')).toBe('AR');
  });
});
