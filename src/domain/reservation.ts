import { LOCK_EXPIRED_LABEL } from './constant';
import { InactiveReason, LockState, Reservation, ReservationStatus } from './interface';

export const isLockActive = (reservation: Reservation, now: number): boolean =>
  reservation.state === LockState.Active && reservation.lockReleaseAt > now;

export const isLockExpired = (reservation: Reservation, now: number): boolean =>
  reservation.state === LockState.Active && reservation.lockReleaseAt <= now;

export const isPlaced = (reservation: Reservation): boolean => reservation.inactiveReason === InactiveReason.Placed;

export const getReservationStatus = (reservation: Reservation): ReservationStatus =>
  isPlaced(reservation) ? ReservationStatus.Placed : ReservationStatus.AwaitingPlacement;

export const formatTimeLeft = (lockReleaseAt: number, now: number): string => {
  const minutes = Math.max(0, Math.ceil((lockReleaseAt - now) / 60000));

  if (minutes < 60) return `${minutes}m left`;

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
};

export const formatLockStatus = (reservation: Reservation, now: number): string =>
  isLockActive(reservation, now) ? formatTimeLeft(reservation.lockReleaseAt, now) : LOCK_EXPIRED_LABEL;
