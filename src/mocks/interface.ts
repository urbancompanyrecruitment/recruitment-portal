import { Aggregator, Candidate, PartnerAccount, Recruiter, Reservation, ReservationEvent } from '@/domain/interface';

export interface MockDb {
  candidates: Candidate[];
  partnerAccounts: PartnerAccount[];
  recruiters: Recruiter[];
  aggregators: Aggregator[];
  reservations: Reservation[];
  reservationEvents: ReservationEvent[];
}

export interface MockChange<T> {
  db: MockDb;
  result: T;
}
