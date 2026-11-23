import { LOCK_EXPIRED_LABEL, LOCK_NO_EXPIRY_LABEL, MINUTES_PER_DAY, MINUTES_PER_HOUR, MS_PER_MINUTE } from './constant';
import { InactiveReason, LockState, Reservation, ReservationStatus } from './interface';

export const isLockActive = (reservation: Reservation, now: number): boolean =>
  reservation.state === LockState.Active && (reservation.lockReleaseAt === undefined || reservation.lockReleaseAt > now);

export const isLockExpired = (reservation: Reservation, now: number): boolean =>
  reservation.state === LockState.Active && reservation.lockReleaseAt !== undefined && reservation.lockReleaseAt <= now;

export const isPlaced = (reservation: Reservation): boolean => reservation.inactiveReason === InactiveReason.Placed;

export const getReservationStatus = (reservation: Reservation): ReservationStatus =>
  isPlaced(reservation) ? ReservationStatus.Placed : ReservationStatus.AwaitingPlacement;

export const formatTimeLeft = (lockReleaseAt: number, now: number): string => {
  const minutes = Math.max(0, Math.ceil((lockReleaseAt - now) / MS_PER_MINUTE));

  if (minutes < MINUTES_PER_HOUR) return `${minutes}m left`;

  if (minutes < MINUTES_PER_DAY) return `${Math.floor(minutes / MINUTES_PER_HOUR)}h ${minutes % MINUTES_PER_HOUR}m left`;

  return `${Math.floor(minutes / MINUTES_PER_DAY)}d ${Math.floor((minutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR)}h left`;
};

export const formatLockStatus = (reservation: Reservation, now: number): string => {
  if (!isLockActive(reservation, now)) return LOCK_EXPIRED_LABEL;

  return reservation.lockReleaseAt === undefined ? LOCK_NO_EXPIRY_LABEL : formatTimeLeft(reservation.lockReleaseAt, now);
};
