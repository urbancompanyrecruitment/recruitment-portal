import { isReservationExpired } from '@/domain/reservation';
import { ReservationEventType } from '@/domain/interface';
import { MAX_RESERVATION_EVENTS, MOCK_DB_STORAGE_KEY } from './constant';
import { MockDb } from './interface';
import { createSeedDb } from './seed';

export const releaseExpiredReservations = (db: MockDb, now: number): MockDb => {
  const expired = db.reservations.filter(reservation => isReservationExpired(reservation, now));
  if (!expired.length) return db;

  return {
    ...db,
    reservations: db.reservations.filter(reservation => !isReservationExpired(reservation, now)),
    reservationEvents: [
      ...db.reservationEvents,
      ...expired.map(reservation => ({
        id: crypto.randomUUID(),
        type: ReservationEventType.Expired,
        candidateId: reservation.candidateId,
        recruiterId: reservation.recruiterId,
        at: now,
      })),
    ].slice(-MAX_RESERVATION_EVENTS),
  };
};

export const writeDb = (db: MockDb): void => {
  localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(db));
};

export const readDb = (now = Date.now()): MockDb => {
  const stored = localStorage.getItem(MOCK_DB_STORAGE_KEY);
  const parsed = stored ? (JSON.parse(stored) as MockDb) : undefined;
  const db = releaseExpiredReservations(parsed ?? createSeedDb(), now);
  if (db !== parsed) writeDb(db);
  return db;
};

export const resetDb = (): MockDb => {
  const db = createSeedDb();
  writeDb(db);
  return db;
};
