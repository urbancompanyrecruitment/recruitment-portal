import dayjs from 'dayjs';
import { ISO_DATE_FORMAT, SLOT_ID_SEPARATOR } from '@/domain/constant';
import {
  Candidate,
  CookingFrequency,
  InactiveReason,
  LockState,
  ProviderCategory,
  RecruitmentSource,
  ReservationEventType,
  YesNo,
} from '@/domain/interface';
import { HOUR_MS, MOCK_LEAD_ID_PREFIX, VERIFIED_BY_IMPORT } from './constant';
import { MockDb } from './interface';

export const createSeedDb = (now = dayjs()): MockDb => {
  const day = (offset: number) => now.add(offset, 'day').format(ISO_DATE_FORMAT);
  const createdAt = (daysAgo: number) => now.subtract(daysAgo, 'day').toISOString();
  const slot = (cityKey: string, dayOffset: number, time: string) => [cityKey, day(dayOffset), time].join(SLOT_ID_SEPARATOR);
  const nowMs = now.valueOf();
  const lead = (id: string, createdDaysAgo: number, approvedDaysAgo?: number) => ({
    leadId: `${MOCK_LEAD_ID_PREFIX}${id}`,
    leadCreatedAt: createdAt(createdDaysAgo),
    approvedAt: approvedDaysAgo === undefined ? undefined : createdAt(approvedDaysAgo),
  });
  const verified = (daysAgo: number) => ({ verified: true, verifiedBy: VERIFIED_BY_IMPORT, verifiedAt: createdAt(daysAgo) });

  const base = {
    consent: true,
    comfortableWithDogs: YesNo.Yes,
    cookingFrequency: CookingFrequency.Frequently,
    deepCleaningExperience: YesNo.Yes,
  };

  const candidates: Candidate[] = [
    { ...base, id: 'c1', name: 'Thandar Aung', primaryPhone: '+65 9000 0001', singaporePhone: '+65 9000 0001', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 31, source: RecruitmentSource.TikTok, interviewCity: 'tampines', slotId: slot('tampines', -2, '09:00'), category: ProviderCategory.RegularCleaning, yearsOfExperience: 5, bio: 'Residential housekeeping, laundry and basic meal preparation. Looking for a full-time cleaning role.', onboarding: lead('c1', 9, 1), ...verified(1), createdAt: createdAt(9) },
    { ...base, id: 'c2', name: 'May Thu', primaryPhone: '+95 9000 0002', singaporePhone: '+65 8000 0002', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 28, source: RecruitmentSource.Referral, referrer: 'Thandar Aung', interviewCity: 'jurong-east', slotId: slot('jurong-east', -4, '10:00'), category: ProviderCategory.PremiumCleaning, yearsOfExperience: 4, bio: 'Household cleaning and cooking experience. Comfortable with pets and detailed home care.', onboarding: lead('c2', 10, 3), ...verified(3), createdAt: createdAt(12) },
    { ...base, id: 'c3', name: 'Siti Rahma', primaryPhone: '+66 9000 0003', singaporePhone: '+65 8000 0003', country: 'Thailand', city: 'Bangkok', nationality: 'Indonesia', age: 35, source: RecruitmentSource.Recruiter, referrer: 'BrightPath Recruitment', interviewCity: 'woodlands', slotId: slot('woodlands', -6, '11:00'), category: ProviderCategory.Ironing, yearsOfExperience: 6, bio: 'Garment care, pressing and laundry organisation. Previously worked in hotel laundry services.', onboarding: lead('c3', 12, 4), ...verified(4), createdAt: createdAt(15) },
    { ...base, id: 'c4', name: 'Hnin Wai', primaryPhone: '+95 9000 0004', singaporePhone: '+65 8000 0004', country: 'Myanmar', city: 'Mandalay', nationality: 'Myanmar', age: 26, source: RecruitmentSource.Direct, interviewCity: 'jurong-east', slotId: slot('jurong-east', -4, '10:00'), category: ProviderCategory.RegularCleaning, yearsOfExperience: 3, bio: 'Household cleaning and room preparation. Available to discuss a new placement.', onboarding: lead('c4', 5, 3), ...verified(3), createdAt: createdAt(6) },
    { ...base, id: 'c5', name: 'Ana Reyes', primaryPhone: '+65 9000 0005', singaporePhone: '+65 9000 0005', country: 'Singapore', city: 'Singapore', nationality: 'Philippines', age: 39, source: RecruitmentSource.TikTok, interviewCity: 'tampines', slotId: slot('tampines', -2, '09:00'), category: ProviderCategory.PremiumCleaning, yearsOfExperience: 8, bio: 'Household care, deep cleaning and cooking. Eight years of relevant experience.', onboarding: lead('c5', 5, 2), ...verified(2), createdAt: createdAt(5) },
    { ...base, id: 'c6', name: 'Nwe Nwe Yi', primaryPhone: '+65 9000 0006', singaporePhone: '+65 9000 0006', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 42, source: RecruitmentSource.Aggregator, referrer: 'HomeCare Collective', interviewCity: 'tampines', slotId: slot('tampines', -2, '09:00'), category: ProviderCategory.RegularCleaning, yearsOfExperience: 10, bio: 'Hotel housekeeping experience, including supervision and quality checks.', onboarding: lead('c6', 4, 2), ...verified(2), createdAt: createdAt(4) },
    { ...base, id: 'c7', name: 'Aye Chan', primaryPhone: '+95 9000 0007', singaporePhone: '+65 8000 0007', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 30, source: RecruitmentSource.Facebook, interviewCity: 'bedok', slotId: slot('bedok', -3, '14:00'), category: ProviderCategory.Ironing, yearsOfExperience: 4, bio: 'Garment care and household ironing experience.', onboarding: lead('c7', 3, 3), ...verified(3), createdAt: createdAt(3) },
    { ...base, id: 'c8', name: 'Mira Santos', primaryPhone: '+66 9000 0008', country: 'Thailand', city: 'Bangkok', nationality: 'Philippines', age: 24, source: RecruitmentSource.TikTok, interviewCity: 'woodlands', slotId: slot('woodlands', 2, '11:00'), category: ProviderCategory.NotAssigned, yearsOfExperience: 2, bio: 'Screening in progress.', verified: false, createdAt: createdAt(2) },
    { ...base, id: 'c9', name: 'Khin Myo', primaryPhone: '+95 9000 0009', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 33, source: RecruitmentSource.TikTok, interviewCity: 'jurong-east', slotId: slot('jurong-east', -4, '10:00'), category: ProviderCategory.NotAssigned, yearsOfExperience: 1, bio: 'Some household cleaning experience.', verified: false, createdAt: createdAt(5) },
    { ...base, id: 'c10', name: 'Rosa Dela Cruz', primaryPhone: '+63 9000 0010', country: 'Philippines', city: 'Manila', nationality: 'Philippines', age: 29, source: RecruitmentSource.Facebook, interviewCity: 'woodlands', slotId: slot('woodlands', 2, '11:00'), category: ProviderCategory.NotAssigned, yearsOfExperience: 3, bio: 'Housekeeping in a serviced apartment.', verified: false, createdAt: createdAt(1) },
    { ...base, id: 'c11', name: 'Zar Ni', primaryPhone: '+65 9000 0011', singaporePhone: '+65 9000 0011', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 27, source: RecruitmentSource.Referral, referrer: 'Nwe Nwe Yi', interviewCity: 'tampines', slotId: slot('tampines', -2, '09:00'), category: ProviderCategory.RegularCleaning, yearsOfExperience: 2, bio: 'Part-time home cleaning for two years.', onboarding: lead('c11', 4), verified: false, createdAt: createdAt(4) },
    { ...base, id: 'c12', name: 'Lin Lin Htet', primaryPhone: '+65 9000 0012', singaporePhone: '+65 9000 0012', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 25, source: RecruitmentSource.TikTok, interviewCity: 'tampines', slotId: slot('tampines', 1, '09:00'), category: ProviderCategory.NotAssigned, yearsOfExperience: 1, bio: 'New to professional cleaning.', onboarding: lead('c12', 0), verified: false, createdAt: createdAt(0) },
    { ...base, id: 'c13', name: 'Dewi Lestari', primaryPhone: '+62 9000 0013', country: 'Indonesia', city: 'Jakarta', nationality: 'Indonesia', age: 36, source: RecruitmentSource.Recruiter, referrer: 'Horizon Recruitment', interviewCity: 'woodlands', slotId: slot('woodlands', 2, '11:00'), category: ProviderCategory.NotAssigned, yearsOfExperience: 5, bio: 'Domestic helper experience.', verified: false, createdAt: createdAt(3) },
    { ...base, id: 'c14', name: 'Su Su Hlaing', primaryPhone: '+95 9000 0014', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 23, source: RecruitmentSource.Influencer, interviewCity: 'ang-mo-kio', slotId: slot('ang-mo-kio', 1, '10:00'), category: ProviderCategory.NotAssigned, yearsOfExperience: 1, bio: 'Hotel housekeeping trainee.', verified: false, createdAt: createdAt(2) },
    { ...base, id: 'c15', name: 'Maria Lopez', primaryPhone: '+65 9000 0015', singaporePhone: '+65 9000 0015', country: 'Singapore', city: 'Singapore', nationality: 'Philippines', age: 45, source: RecruitmentSource.Direct, interviewCity: 'bedok', slotId: slot('bedok', 1, '10:00'), category: ProviderCategory.NotAssigned, yearsOfExperience: 12, bio: 'Long-term live-in domestic helper.', onboarding: lead('c15', 1), verified: false, cookingFrequency: CookingFrequency.Daily, createdAt: createdAt(1) },
  ];

  return {
    candidates,
    recruiters: [
      { id: 'r-a', name: 'Alex Morgan', company: 'BrightPath Recruitment', loginId: 'recruiter.a', active: true },
      { id: 'r-b', name: 'Jamie Lee', company: 'Horizon Recruitment', loginId: 'recruiter.b', active: true },
    ],
    aggregators: [
      { id: 'ag-1', name: 'CleanSpace Services', quota: 10 },
      { id: 'ag-2', name: 'HomeCare Collective', quota: 12 },
      { id: 'ag-3', name: 'Everyday Living Services', quota: 8 },
      { id: 'ag-4', name: 'BrightHome Partners', quota: 6 },
    ],
    reservations: [
      { candidateId: 'c5', recruiterId: 'r-a', lockedAt: nowMs - 24 * HOUR_MS, lockReleaseAt: nowMs + 24 * HOUR_MS, state: LockState.Inactive, inactiveReason: InactiveReason.Placed, inactiveAt: nowMs - 20 * HOUR_MS, startDate: day(10), aggregatorId: 'ag-2', hub: 'Tampines · East cluster', hubInstructions: 'Coordinate a stay location within the East cluster. Confirm the exact accommodation with UC before making arrangements.' },
      { candidateId: 'c2', recruiterId: 'r-a', lockedAt: nowMs - 30 * HOUR_MS, lockReleaseAt: nowMs + 18 * HOUR_MS, state: LockState.Inactive, inactiveReason: InactiveReason.Placed, inactiveAt: nowMs - 28 * HOUR_MS, startDate: day(30), aggregatorId: 'ag-1' },
      { candidateId: 'c6', recruiterId: 'r-a', lockedAt: nowMs - 46 * HOUR_MS, lockReleaseAt: nowMs + 2 * HOUR_MS, state: LockState.Active },
      { candidateId: 'c7', recruiterId: 'r-b', lockedAt: nowMs - HOUR_MS, lockReleaseAt: nowMs + 47 * HOUR_MS, state: LockState.Active },
    ],
    reservationEvents: [
      { id: 'e1', type: ReservationEventType.Opened, candidateId: 'c4', recruiterId: 'r-b', at: nowMs - 5 * 24 * HOUR_MS },
      { id: 'e2', type: ReservationEventType.Expired, candidateId: 'c4', recruiterId: 'r-b', at: nowMs - 3 * 24 * HOUR_MS },
      { id: 'e3', type: ReservationEventType.Opened, candidateId: 'c2', recruiterId: 'r-a', at: nowMs - 30 * HOUR_MS },
      { id: 'e4', type: ReservationEventType.PlacementSaved, candidateId: 'c2', recruiterId: 'r-a', at: nowMs - 28 * HOUR_MS },
      { id: 'e5', type: ReservationEventType.Opened, candidateId: 'c5', recruiterId: 'r-a', at: nowMs - 24 * HOUR_MS },
      { id: 'e6', type: ReservationEventType.PlacementSaved, candidateId: 'c5', recruiterId: 'r-a', at: nowMs - 20 * HOUR_MS },
      { id: 'e7', type: ReservationEventType.HubUpdated, candidateId: 'c5', at: nowMs - 2 * HOUR_MS },
      { id: 'e8', type: ReservationEventType.Opened, candidateId: 'c6', recruiterId: 'r-a', at: nowMs - 46 * HOUR_MS },
      { id: 'e9', type: ReservationEventType.Opened, candidateId: 'c7', recruiterId: 'r-b', at: nowMs - HOUR_MS },
    ],
  };
};
