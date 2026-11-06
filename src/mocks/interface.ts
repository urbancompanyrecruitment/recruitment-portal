import { Aggregator, Candidate, Recruiter, Reservation, ReservationEvent } from '@/domain/interface';

export interface MockDb {
  candidates: Candidate[];
  recruiters: Recruiter[];
  aggregators: Aggregator[];
  reservations: Reservation[];
  reservationEvents: ReservationEvent[];
}

export interface MockChange<T> {
  db: MockDb;
  result: T;
}
