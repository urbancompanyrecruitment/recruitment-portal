import {
  Aggregator,
  Candidate,
  InterviewSlot,
  Recruiter,
  Reservation,
  ReservationEvent,
  Trainer,
} from '@/domain/interface';

export interface MockDb {
  candidates: Candidate[];
  slots: InterviewSlot[];
  trainers: Trainer[];
  recruiters: Recruiter[];
  aggregators: Aggregator[];
  reservations: Reservation[];
  reservationEvents: ReservationEvent[];
}

export interface MockChange<T> {
  db: MockDb;
  result: T;
}
