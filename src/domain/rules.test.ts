import dayjs from 'dayjs';
import { ANA, CANDIDATES, CITIES, THANDAR } from '@/test/fixtures';
import { LOCK_EXPIRED_LABEL, LOCK_NO_EXPIRY_LABEL } from './constant';
import { formatLocation, getInitials } from './format';
import { buildChannelFunnel } from './funnel';
import { InactiveReason, LockOrigin, LockState, RecruitmentSource, ReservationStatus } from './interface';
import { isSingaporePhone, isValidSingaporePhone, phoneDigits } from './phone';
import { formatLockStatus, formatTimeLeft, getReservationStatus, isLockActive, isLockExpired, isPlaced } from './reservation';
import { findCity, formatSlot, parseSlotId } from './slot';

describe('lock rules', () => {
  const active = { id: 'l1', candidateId: 'c1', recruiterId: 'r-a', origin: LockOrigin.Recruiter, lockedAt: 0, lockReleaseAt: 1000, state: LockState.Active };
  const noExpiry = { ...active, origin: LockOrigin.Registration, lockReleaseAt: undefined };
  const placed = { ...active, state: LockState.Inactive, inactiveReason: InactiveReason.Placed, employerName: 'X', startDate: '2026-12-01' };

  it('treats a lock as active only until its release time', () => {
    expect(isLockActive(active, 999)).toBe(true);
    expect(isLockActive(active, 1000)).toBe(false);
    expect(isLockExpired(active, 1000)).toBe(true);
    expect(isLockExpired(placed, 5000)).toBe(false);
  });

  it('never expires a lock without a release time until it is released or placed', () => {
    expect(isLockActive(noExpiry, Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(isLockExpired(noExpiry, Number.MAX_SAFE_INTEGER)).toBe(false);
    expect(formatLockStatus(noExpiry, 5000)).toBe(LOCK_NO_EXPIRY_LABEL);
    expect(isLockActive({ ...noExpiry, state: LockState.Inactive }, 0)).toBe(false);
  });

  it('derives the placement status from the inactive reason', () => {
    expect(isPlaced(placed)).toBe(true);
    expect(getReservationStatus(active)).toBe(ReservationStatus.AwaitingPlacement);
    expect(getReservationStatus(placed)).toBe(ReservationStatus.Placed);
  });

  it('formats time left and the expired state', () => {
    expect(formatTimeLeft(125 * 60000, 0)).toBe('2h 5m left');
    expect(formatTimeLeft(72 * 60 * 60000, 0)).toBe('3d 0h left');
    expect(formatTimeLeft((26 * 60 + 5) * 60000, 0)).toBe('1d 2h left');
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
    expect(formatSlot(parseSlotId('yangon_2026-10-30_09:00', 'Asia/Yangon')!)).toBe('Fri, 30 Oct 2026 · 09:00 · Asia/Yangon');
    expect(findCity(CITIES, 'tampines')?.name).toBe('Tampines');
    expect(findCity(CITIES, 'nowhere')).toBeUndefined();
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

  it('leaves the country out of a location when it is Others', () => {
    expect(formatLocation({ city: 'Yangon', country: 'Myanmar' })).toBe('Yangon, Myanmar');
    expect(formatLocation({ city: 'Bangkok', country: 'Others' })).toBe('Bangkok');
  });
});
