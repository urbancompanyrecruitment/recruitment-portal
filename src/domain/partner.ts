import { Candidate, PartnerStage, Reservation } from './interface';

export const getPartnerStage = (candidate: Candidate, reservation?: Reservation): PartnerStage => {
  if (reservation?.aggregatorId) return PartnerStage.Placed;

  if (candidate.verified) return PartnerStage.Verified;

  return PartnerStage.Registered;
};
