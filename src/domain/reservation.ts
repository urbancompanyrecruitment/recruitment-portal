import dayjs from 'dayjs';
import { HUB_NOTICE_WINDOW_DAYS } from './constant';
import { Reservation, ReservationStatus } from './interface';

export const isReservationExpired = (reservation: Reservation, now: number): boolean =>
  !reservation.aggregatorId && reservation.deadlineAt <= now;

export const getReservationStatus = (reservation: Reservation): ReservationStatus =>
  reservation.aggregatorId ? ReservationStatus.AggregatorAssigned : ReservationStatus.AwaitingAggregator;

export const formatTimeLeft = (deadlineAt: number, now: number): string => {
  const minutes = Math.max(0, Math.ceil((deadlineAt - now) / 60000));
  if (minutes < 60) return `${minutes}m left`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
};

export const isJoiningWithinNoticeWindow = (reservation: Reservation, today: string): boolean => {
  if (!reservation.aggregatorId || !reservation.startDate) return false;
  const daysToStart = dayjs(reservation.startDate).diff(dayjs(today), 'day');
  return daysToStart >= 0 && daysToStart <= HUB_NOTICE_WINDOW_DAYS;
};
