import { RESERVATION_WINDOW_MS } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { Reservation, ReservationEvent, ReservationEventType } from '@/domain/interface';
import { MAX_RESERVATION_EVENTS } from '@/mocks/constant';
import { releaseExpiredReservations, resetDb } from '@/mocks/db';
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

const findOwnReservation = (db: MockDb, candidateId: string, recruiterId: string): Reservation =>
  findOrThrow(
    db.reservations,
    reservation => reservation.candidateId === candidateId && reservation.recruiterId === recruiterId,
    API_ERROR.reservationNotFound,
  );

export const listReservations = (): Promise<Reservation[]> => mockQuery(db => db.reservations);

export const listReservationEvents = (): Promise<ReservationEvent[]> =>
  mockQuery(db => [...db.reservationEvents].sort((a, b) => b.at - a.at));

export const listAvailableCandidates = (): Promise<AvailableCandidate[]> =>
  mockQuery(db =>
    db.candidates
      .filter(candidate => candidate.verified)
      .filter(candidate => !db.reservations.some(reservation => reservation.candidateId === candidate.id))
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
      })),
  );

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
    reservation: findOwnReservation(db, candidateId, recruiterId),
    candidate: findOrThrow(db.candidates, candidate => candidate.id === candidateId, API_ERROR.candidateNotFound),
  }));

export const reserveCandidate = (candidateId: string, recruiterId: string): Promise<Reservation> =>
  mockMutation(db => {
    const candidate = db.candidates.find(item => item.id === candidateId);
    if (!candidate?.verified) throw new Error(API_ERROR.profileUnavailable);

    const existing = db.reservations.find(reservation => reservation.candidateId === candidateId);
    if (existing && existing.recruiterId !== recruiterId) throw new Error(API_ERROR.reservedByOther);
    if (existing) return { db, result: existing };

    const now = Date.now();
    const reservation: Reservation = { candidateId, recruiterId, openedAt: now, deadlineAt: now + RESERVATION_WINDOW_MS };
    return {
      db: {
        ...db,
        reservations: [...db.reservations, reservation],
        reservationEvents: appendEvent(db, ReservationEventType.Opened, candidateId, recruiterId),
      },
      result: reservation,
    };
  });

export const savePlacement = (candidateId: string, recruiterId: string, input: PlacementInput): Promise<Reservation> =>
  mockMutation(db => {
    const current = findOwnReservation(db, candidateId, recruiterId);
    const isKnownAggregator = db.aggregators.some(aggregator => aggregator.id === input.aggregatorId);
    if (!isKnownAggregator || input.startDate < toIsoDate()) throw new Error(API_ERROR.invalidPlacement);

    const next = { ...current, ...input };
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

export const expireUnassignedReservations = (recruiterId: string): Promise<number> =>
  mockMutation(db => {
    const now = Date.now();
    const due = db.reservations.filter(reservation => reservation.recruiterId === recruiterId && !reservation.aggregatorId);
    const forced = {
      ...db,
      reservations: db.reservations.map(reservation =>
        due.includes(reservation) ? { ...reservation, deadlineAt: now - 1 } : reservation,
      ),
    };
    return { db: releaseExpiredReservations(forced, now), result: due.length };
  });

export const resetMockData = async (): Promise<void> => {
  resetDb();
};
