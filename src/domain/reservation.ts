import dayjs from 'dayjs';
import { HUB_NOTICE_WINDOW_DAYS, LOCK_EXPIRED_LABEL } from './constant';
import { LockState, Reservation, ReservationStatus } from './interface';

export const isLockActive = (reservation: Reservation, now: number): boolean =>
  reservation.state === LockState.Active && reservation.lockReleaseAt > now;

export const isLockExpired = (reservation: Reservation, now: number): boolean =>
  reservation.state === LockState.Active && reservation.lockReleaseAt <= now;

export const blocksAvailability = (reservation: Reservation, now: number): boolean =>
  Boolean(reservation.aggregatorId) || isLockActive(reservation, now);

export const getReservationStatus = (reservation: Reservation): ReservationStatus =>
  reservation.aggregatorId ? ReservationStatus.AggregatorAssigned : ReservationStatus.AwaitingAggregator;

export const formatTimeLeft = (lockReleaseAt: number, now: number): string => {
  const minutes = Math.max(0, Math.ceil((lockReleaseAt - now) / 60000));

  if (minutes < 60) return `${minutes}m left`;

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
};

export const formatLockStatus = (reservation: Reservation, now: number): string =>
  isLockActive(reservation, now) ? formatTimeLeft(reservation.lockReleaseAt, now) : LOCK_EXPIRED_LABEL;

export const isJoiningWithinNoticeWindow = (reservation: Reservation, today: string): boolean => {
  if (!reservation.aggregatorId || !reservation.startDate) return false;

  const daysToStart = dayjs(reservation.startDate).diff(dayjs(today), 'day');

  return daysToStart >= 0 && daysToStart <= HUB_NOTICE_WINDOW_DAYS;
};
