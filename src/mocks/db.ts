import { InactiveReason, LockState, ReservationEventType } from '@/domain/interface';
import { isLockExpired } from '@/domain/reservation';
import { MAX_RESERVATION_EVENTS, MOCK_DB_STORAGE_KEY } from './constant';
import { MockDb } from './interface';
import { createSeedDb } from './seed';

export const deactivateExpiredLocks = (db: MockDb, now: number): MockDb => {
  const expired = db.reservations.filter(reservation => isLockExpired(reservation, now));

  if (!expired.length) return db;

  return {
    ...db,
    reservations: db.reservations.map(reservation =>
      expired.includes(reservation)
        ? { ...reservation, state: LockState.Inactive, inactiveReason: InactiveReason.Expired, inactiveAt: now }
        : reservation,
    ),
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

export const readDb = (): MockDb => {
  const stored = localStorage.getItem(MOCK_DB_STORAGE_KEY);

  if (stored) return JSON.parse(stored) as MockDb;

  const db = createSeedDb();
  writeDb(db);

  return db;
};

export const resetDb = (): MockDb => {
  const db = createSeedDb();
  writeDb(db);

  return db;
};
