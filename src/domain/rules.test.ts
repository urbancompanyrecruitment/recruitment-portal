import dayjs from 'dayjs';
import { createSeedDb } from '@/mocks/seed';
import { buildChannelFunnel, formatPassRate } from './funnel';
import { Geography, RecruitmentSource, ReservationStatus } from './interface';
import {
  formatTimeLeft,
  getReservationStatus,
  isJoiningWithinNoticeWindow,
  isReservationExpired,
} from './reservation';
import { countSlotBookings, formatSlot, listBookableSlots } from './slot';
import { getInitials } from './format';

const now = dayjs('2026-10-27T10:00:00');
const seed = createSeedDb(now);
const today = now.format('YYYY-MM-DD');

describe('reservation rules', () => {
  const base = { candidateId: 'c1', recruiterId: 'r-a', openedAt: 0, deadlineAt: 1000 };

  it('expires only unassigned reservations past their deadline', () => {
    expect(isReservationExpired(base, 999)).toBe(false);
    expect(isReservationExpired(base, 1000)).toBe(true);
    expect(isReservationExpired({ ...base, aggregatorId: 'ag-1' }, 5000)).toBe(false);
  });

  it('reports status from aggregator assignment', () => {
    expect(getReservationStatus(base)).toBe(ReservationStatus.AwaitingAggregator);
    expect(getReservationStatus({ ...base, aggregatorId: 'ag-1' })).toBe(ReservationStatus.AggregatorAssigned);
  });

  it('formats time left in hours and minutes', () => {
    expect(formatTimeLeft(0 + 125 * 60000, 0)).toBe('2h 5m left');
    expect(formatTimeLeft(45 * 60000, 0)).toBe('45m left');
    expect(formatTimeLeft(0, 60000)).toBe('0m left');
  });

  it('flags placements joining within two weeks', () => {
    const placed = { ...base, aggregatorId: 'ag-1' };

    expect(isJoiningWithinNoticeWindow({ ...placed, startDate: '2026-11-05' }, today)).toBe(true);
    expect(isJoiningWithinNoticeWindow({ ...placed, startDate: '2026-11-20' }, today)).toBe(false);
    expect(isJoiningWithinNoticeWindow({ ...base, startDate: '2026-11-05' }, today)).toBe(false);
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
    const rows = buildChannelFunnel(seed.candidates, now.subtract(6, 'day').format('YYYY-MM-DD'));
    const tiktok = rows.find(row => row.source === RecruitmentSource.TikTok)!;

    expect(tiktok.signups).toBe(4);
    expect(tiktok.selected).toBe(1);
    expect(tiktok.conversion).toBe(25);
    expect(tiktok.passRates.l1).toEqual({ passed: 2, assessed: 2 });
    expect(tiktok.passRates.l2).toEqual({ passed: 1, assessed: 2 });
  });

  it('excludes signups outside the week', () => {
    const rows = buildChannelFunnel(seed.candidates, now.subtract(30, 'day').format('YYYY-MM-DD'));

    expect(rows).toEqual([]);
  });

  it('formats pass rates and handles no assessments', () => {
    expect(formatPassRate({ passed: 1, assessed: 2 })).toBe('50% (1/2)');
    expect(formatPassRate({ passed: 0, assessed: 0 })).toBe('—');
  });
});

describe('format helpers', () => {
  it('builds initials from the first two names', () => {
    expect(getInitials('Nwe Nwe Yi')).toBe('NN');
    expect(getInitials('ana reyes')).toBe('AR');
  });
});
