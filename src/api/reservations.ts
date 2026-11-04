import { LOCK_TTL_MS } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { InactiveReason, LockState, Reservation, ReservationEvent, ReservationEventType } from '@/domain/interface';
import { blocksAvailability, isLockActive, isLockExpired } from '@/domain/reservation';
import { MAX_RESERVATION_EVENTS } from '@/mocks/constant';
import { deactivateExpiredLocks, resetDb } from '@/mocks/db';
import { MockDb } from '@/mocks/interface';
import { findOrThrow, mockMutation, mockQuery } from './client';
import { API_ERROR } from './constant';
import { AvailableCandidate, HubUpdateInput, PlacementInput, ReservedCandidate } from './interface';

const appendEvent = (
  db: MockDb,
  type: ReservationEventType,
  candidateId: string,
  recruiterId?: string,
): ReservationEvent[] =>
  [...db.reservationEvents, { id: crypto.randomUUID(), type, candidateId, recruiterId, at: Date.now() }].slice(
    -MAX_RESERVATION_EVENTS,
  );

const replaceReservation = (db: MockDb, next: Reservation): Reservation[] =>
  db.reservations.map(reservation => (reservation.candidateId === next.candidateId ? next : reservation));

const findOwnReservation = (db: MockDb, candidateId: string, recruiterId: string, now: number): Reservation => {
  const reservation = findOrThrow(
    db.reservations,
    item => item.candidateId === candidateId && item.recruiterId === recruiterId,
    API_ERROR.reservationNotFound,
  );

  if (!reservation.aggregatorId && !isLockActive(reservation, now)) throw new Error(API_ERROR.lockExpired);

  return reservation;
};

export const listReservations = (): Promise<Reservation[]> => mockQuery(db => db.reservations);

export const listReservationEvents = (): Promise<ReservationEvent[]> =>
  mockQuery(db => [...db.reservationEvents].sort((a, b) => b.at - a.at));

export const listAvailableCandidates = (): Promise<AvailableCandidate[]> =>
  mockQuery(db => {
    const now = Date.now();

    return db.candidates
      .filter(candidate => candidate.verified)
      .filter(
        candidate =>
          !db.reservations.some(
            reservation => reservation.candidateId === candidate.id && blocksAvailability(reservation, now),
          ),
      )
      .map(({ id, name, country, city, nationality, category, yearsOfExperience, bio, verified }) => ({
        id,
        name,
        country,
        city,
        nationality,
        category,
        yearsOfExperience,
        bio,
        verified,
      }));
  });

export const listMyReservations = (recruiterId: string): Promise<ReservedCandidate[]> =>
  mockQuery(db =>
    db.reservations
      .filter(reservation => reservation.recruiterId === recruiterId)
      .map(reservation => ({
        reservation,
        candidate: findOrThrow(db.candidates, candidate => candidate.id === reservation.candidateId, API_ERROR.candidateNotFound),
      })),
  );

export const getReservedCandidate = (candidateId: string, recruiterId: string): Promise<ReservedCandidate> =>
  mockQuery(db => ({
    reservation: findOwnReservation(db, candidateId, recruiterId, Date.now()),
    candidate: findOrThrow(db.candidates, candidate => candidate.id === candidateId, API_ERROR.candidateNotFound),
  }));

export const reserveCandidate = (candidateId: string, recruiterId: string): Promise<Reservation> =>
  mockMutation(db => {
    const candidate = db.candidates.find(item => item.id === candidateId);

    if (!candidate?.verified) throw new Error(API_ERROR.profileUnavailable);

    const now = Date.now();
    const existing = db.reservations.find(reservation => reservation.candidateId === candidateId);
    const blocked = existing ? blocksAvailability(existing, now) : false;

    if (existing && blocked && existing.recruiterId !== recruiterId) throw new Error(API_ERROR.reservedByOther);

    if (existing && blocked) return { db, result: existing };

    const reservation: Reservation = {
      candidateId,
      recruiterId,
      lockedAt: now,
      lockReleaseAt: now + LOCK_TTL_MS,
      state: LockState.Active,
    };

    return {
      db: {
        ...db,
        reservations: [...db.reservations.filter(item => item.candidateId !== candidateId), reservation],
        reservationEvents: appendEvent(db, ReservationEventType.Opened, candidateId, recruiterId),
      },
      result: reservation,
    };
  });

export const savePlacement = (candidateId: string, recruiterId: string, input: PlacementInput): Promise<Reservation> =>
  mockMutation(db => {
    const now = Date.now();
    const current = findOwnReservation(db, candidateId, recruiterId, now);
    const isKnownAggregator = db.aggregators.some(aggregator => aggregator.id === input.aggregatorId);

    if (!isKnownAggregator || input.startDate < toIsoDate()) throw new Error(API_ERROR.invalidPlacement);

    const next: Reservation = {
      ...current,
      ...input,
      state: LockState.Inactive,
      inactiveReason: InactiveReason.Placed,
      inactiveAt: current.inactiveAt ?? now,
    };

    return {
      db: {
        ...db,
        reservations: replaceReservation(db, next),
        reservationEvents: appendEvent(db, ReservationEventType.PlacementSaved, candidateId, recruiterId),
      },
      result: next,
    };
  });

export const updateHub = (candidateId: string, input: HubUpdateInput): Promise<Reservation> =>
  mockMutation(db => {
    const current = findOrThrow(
      db.reservations,
      reservation => reservation.candidateId === candidateId,
      API_ERROR.reservationNotFound,
    );
    const next = { ...current, ...input };

    return {
      db: {
        ...db,
        reservations: replaceReservation(db, next),
        reservationEvents: appendEvent(db, ReservationEventType.HubUpdated, candidateId),
      },
      result: next,
    };
  });

export const runLockCleanup = (): Promise<number> =>
  mockMutation(db => {
    const now = Date.now();
    const expired = db.reservations.filter(reservation => isLockExpired(reservation, now)).length;

    return { db: deactivateExpiredLocks(db, now), result: expired };
  });

export const expireUnassignedReservations = (recruiterId: string): Promise<number> =>
  mockMutation(db => {
    const now = Date.now();
    const due = db.reservations.filter(
      reservation => reservation.recruiterId === recruiterId && isLockActive(reservation, now),
    );
    const forced = {
      ...db,
      reservations: db.reservations.map(reservation =>
        due.includes(reservation) ? { ...reservation, lockReleaseAt: now - 1 } : reservation,
      ),
    };

    return { db: deactivateExpiredLocks(forced, now), result: due.length };
  });

export const resetMockData = async (): Promise<void> => {
  resetDb();
};
