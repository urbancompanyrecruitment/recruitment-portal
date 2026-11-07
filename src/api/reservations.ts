import { AdminReservation, Reservation } from '@/domain/interface';
import { API_PATH } from './constant';
import { request } from './http';
import { AvailableCandidate, BackendAdminLock, BackendLock, BackendLockedPartner, PlacementInput, ReservedCandidate } from './interface';

const toEpoch = (value: string | undefined): number | undefined => (value ? Date.parse(value) : undefined);

export const toReservation = (lock: BackendLock): Reservation => ({
  id: lock.id,
  candidateId: lock.partnerId,
  recruiterId: lock.recruiterId,
  lockedAt: Date.parse(lock.lockedAt),
  lockReleaseAt: Date.parse(lock.lockReleaseAt),
  state: lock.state,
  inactiveReason: lock.inactiveReason,
  inactiveAt: toEpoch(lock.inactiveAt),
  employerName: lock.employerName,
  startDate: lock.startDate,
  placementRecordedAt: toEpoch(lock.placementRecordedAt),
});

const toReservedCandidate = (locked: BackendLockedPartner): ReservedCandidate => ({
  candidate: locked.partner,
  reservation: toReservation(locked.lock),
});

export const listReservations = async (): Promise<AdminReservation[]> =>
  (await request<BackendAdminLock[]>(API_PATH.adminLocks)).map(lock => ({
    ...toReservation(lock),
    candidateName: lock.partnerName,
    recruiterName: lock.recruiterName,
    recruiterCompany: lock.recruiterCompany,
  }));

export const listAvailableCandidates = (): Promise<AvailableCandidate[]> =>
  request<AvailableCandidate[]>(API_PATH.availablePartners);

export const listMyReservations = async (): Promise<ReservedCandidate[]> =>
  (await request<BackendLockedPartner[]>(API_PATH.myLocks)).map(toReservedCandidate);

export const getReservedCandidate = async (candidateId: string): Promise<ReservedCandidate> =>
  toReservedCandidate(await request<BackendLockedPartner>(API_PATH.lockedPartner(candidateId)));

export const reserveCandidate = async (candidateId: string): Promise<ReservedCandidate> =>
  toReservedCandidate(await request<BackendLockedPartner>(API_PATH.lockPartner(candidateId), { method: 'POST' }));

export const savePlacement = async (candidateId: string, input: PlacementInput): Promise<Reservation> =>
  toReservation(await request<BackendLock>(API_PATH.placement(candidateId), { method: 'POST', body: input }));

export const releaseReservation = async (candidateId: string): Promise<Reservation> =>
  toReservation(await request<BackendLock>(API_PATH.release(candidateId), { method: 'POST' }));
