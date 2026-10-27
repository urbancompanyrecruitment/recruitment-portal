import dayjs from 'dayjs';
import { PENDING_RESULTS } from '@/domain/constant';
import {
  Candidate,
  CookingFrequency,
  Geography,
  InterviewSlot,
  InvitationStatus,
  ProviderCategory,
  RecruitmentSource,
  ReservationEventType,
  StageResult,
  YesNo,
} from '@/domain/interface';
import {
  HOUR_MS,
  MYANMAR_CENTRE,
  PASSED_ALL_RESULTS,
  REMOTE_CENTRE,
  SINGAPORE_CENTRE,
} from './constant';
import { MockDb } from './interface';

export const createSeedDb = (now = dayjs()): MockDb => {
  const day = (offset: number) => now.add(offset, 'day').format('YYYY-MM-DD');
  const createdAt = (daysAgo: number) => now.subtract(daysAgo, 'day').toISOString();
  const nowMs = now.valueOf();

  const slots: InterviewSlot[] = [
    { id: 's1', geography: Geography.Singapore, date: day(3), time: '09:30', timeZone: 'Asia/Singapore', trainerId: 't-sg', capacity: 8, isOpen: true, ...SINGAPORE_CENTRE },
    { id: 's2', geography: Geography.Singapore, date: day(4), time: '14:00', timeZone: 'Asia/Singapore', trainerId: 't-sg2', capacity: 8, isOpen: true, ...SINGAPORE_CENTRE },
    { id: 's3', geography: Geography.Myanmar, date: day(3), time: '10:00', timeZone: 'Asia/Yangon', trainerId: 't-mm', capacity: 8, isOpen: true, ...MYANMAR_CENTRE },
    { id: 's4', geography: Geography.Overseas, date: day(5), time: '11:00', timeZone: 'Asia/Singapore', trainerId: 't-os', capacity: 6, isOpen: true, ...REMOTE_CENTRE },
    { id: 's5', geography: Geography.Singapore, date: day(-2), time: '09:30', timeZone: 'Asia/Singapore', trainerId: 't-sg', capacity: 8, isOpen: true, ...SINGAPORE_CENTRE },
    { id: 's6', geography: Geography.Myanmar, date: day(-4), time: '10:00', timeZone: 'Asia/Yangon', trainerId: 't-mm', capacity: 8, isOpen: true, ...MYANMAR_CENTRE },
    { id: 's7', geography: Geography.Singapore, date: day(1), time: '10:00', timeZone: 'Asia/Singapore', trainerId: 't-sg', capacity: 2, isOpen: true, ...SINGAPORE_CENTRE },
    { id: 's8', geography: Geography.Overseas, date: day(-6), time: '11:00', timeZone: 'Asia/Singapore', trainerId: 't-os', capacity: 6, isOpen: true, ...REMOTE_CENTRE },
  ];

  const base = {
    consent: true,
    attempts: [],
    notes: [],
    l1Completed: true,
    invitationStatus: InvitationStatus.Completed,
    comfortableWithDogs: YesNo.Yes,
    cookingFrequency: CookingFrequency.Frequently,
    deepCleaningExperience: YesNo.Yes,
  };

  const candidates: Candidate[] = [
    { ...base, id: 'c1', name: 'Thandar Aung', phone: '+65 0000 0001', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 31, source: RecruitmentSource.TikTok, interviewGeography: Geography.Singapore, slotId: 's5', category: ProviderCategory.RegularCleaning, yearsOfExperience: 5, bio: 'Residential housekeeping, laundry and basic meal preparation. Looking for a full-time cleaning role.', results: PASSED_ALL_RESULTS, verified: true, verifiedBy: 'Sarah Tan', verifiedAt: createdAt(1), createdAt: createdAt(9), notes: [{ id: 'n1', by: 'Sarah Tan', at: createdAt(1), text: 'Strong practical test. Very thorough with kitchen surfaces.' }] },
    { ...base, id: 'c2', name: 'May Thu', phone: '+95 0000 0002', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 28, source: RecruitmentSource.Referral, referrer: 'Thandar Aung', interviewGeography: Geography.Myanmar, slotId: 's6', category: ProviderCategory.PremiumCleaning, yearsOfExperience: 4, bio: 'Household cleaning and cooking experience. Comfortable with pets and detailed home care.', results: PASSED_ALL_RESULTS, verified: true, verifiedBy: 'Su Mon', verifiedAt: createdAt(3), createdAt: createdAt(12) },
    { ...base, id: 'c3', name: 'Siti Rahma', phone: '+66 0000 0003', country: 'Thailand', city: 'Bangkok', nationality: 'Indonesia', age: 35, source: RecruitmentSource.Recruiter, referrer: 'BrightPath Recruitment', interviewGeography: Geography.Overseas, slotId: 's8', category: ProviderCategory.Ironing, yearsOfExperience: 6, bio: 'Garment care, pressing and laundry organisation. Previously worked in hotel laundry services.', results: PASSED_ALL_RESULTS, verified: true, verifiedBy: 'Priya Shah', verifiedAt: createdAt(4), createdAt: createdAt(15) },
    { ...base, id: 'c4', name: 'Hnin Wai', phone: '+95 0000 0004', country: 'Myanmar', city: 'Mandalay', nationality: 'Myanmar', age: 26, source: RecruitmentSource.Direct, interviewGeography: Geography.Myanmar, slotId: 's6', category: ProviderCategory.RegularCleaning, yearsOfExperience: 3, bio: 'Household cleaning and room preparation. Available to discuss a new placement.', results: PASSED_ALL_RESULTS, verified: true, verifiedBy: 'Su Mon', verifiedAt: createdAt(3), createdAt: createdAt(6) },
    { ...base, id: 'c5', name: 'Ana Reyes', phone: '+65 0000 0005', country: 'Singapore', city: 'Singapore', nationality: 'Philippines', age: 39, source: RecruitmentSource.TikTok, interviewGeography: Geography.Singapore, slotId: 's5', category: ProviderCategory.PremiumCleaning, yearsOfExperience: 8, bio: 'Household care, deep cleaning and cooking. Eight years of relevant experience.', results: PASSED_ALL_RESULTS, verified: true, verifiedBy: 'Sarah Tan', verifiedAt: createdAt(2), createdAt: createdAt(5) },
    { ...base, id: 'c6', name: 'Nwe Nwe Yi', phone: '+65 0000 0006', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 42, source: RecruitmentSource.Aggregator, referrer: 'HomeCare Collective', interviewGeography: Geography.Singapore, slotId: 's5', category: ProviderCategory.RegularCleaning, yearsOfExperience: 10, bio: 'Hotel housekeeping experience, including supervision and quality checks.', results: PASSED_ALL_RESULTS, verified: true, verifiedBy: 'Sarah Tan', verifiedAt: createdAt(2), createdAt: createdAt(4) },
    { ...base, id: 'c7', name: 'Aye Chan', phone: '+95 0000 0007', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 30, source: RecruitmentSource.Facebook, interviewGeography: Geography.Myanmar, slotId: 's6', category: ProviderCategory.Ironing, yearsOfExperience: 4, bio: 'Garment care and household ironing experience.', results: PASSED_ALL_RESULTS, verified: true, verifiedBy: 'Su Mon', verifiedAt: createdAt(3), createdAt: createdAt(3) },
    { ...base, id: 'c8', name: 'Mira Santos', phone: '+66 0000 0008', country: 'Thailand', city: 'Bangkok', nationality: 'Philippines', age: 24, source: RecruitmentSource.TikTok, interviewGeography: Geography.Overseas, slotId: 's4', category: ProviderCategory.NotAssigned, yearsOfExperience: 2, bio: 'Screening in progress.', results: { ...PENDING_RESULTS }, verified: false, l1Completed: false, invitationStatus: InvitationStatus.Sent, createdAt: createdAt(2) },
    { ...base, id: 'c9', name: 'Khin Myo', phone: '+95 0000 0009', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 33, source: RecruitmentSource.TikTok, interviewGeography: Geography.Myanmar, slotId: 's6', category: ProviderCategory.NotAssigned, yearsOfExperience: 1, bio: 'Some household cleaning experience.', results: { l1: StageResult.Passed, l2: StageResult.Failed, l3: StageResult.Pending }, verified: false, createdAt: createdAt(5), notes: [{ id: 'n2', by: 'Su Mon', at: createdAt(4), text: 'Rushed the bathroom task; missed grout and fixtures. Can re-apply after training.' }] },
    { ...base, id: 'c10', name: 'Rosa Dela Cruz', phone: '+63 0000 0010', country: 'Philippines', city: 'Manila', nationality: 'Philippines', age: 29, source: RecruitmentSource.Facebook, interviewGeography: Geography.Overseas, slotId: 's4', category: ProviderCategory.NotAssigned, yearsOfExperience: 3, bio: 'Housekeeping in a serviced apartment.', results: { ...PENDING_RESULTS }, verified: false, createdAt: createdAt(1) },
    { ...base, id: 'c11', name: 'Zar Ni', phone: '+65 0000 0011', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 27, source: RecruitmentSource.Referral, referrer: 'Nwe Nwe Yi', interviewGeography: Geography.Singapore, slotId: 's5', category: ProviderCategory.RegularCleaning, yearsOfExperience: 2, bio: 'Part-time home cleaning for two years.', results: { l1: StageResult.Passed, l2: StageResult.Passed, l3: StageResult.Pending }, verified: false, createdAt: createdAt(4) },
    { ...base, id: 'c12', name: 'Lin Lin Htet', phone: '+65 0000 0012', country: 'Singapore', city: 'Singapore', nationality: 'Myanmar', age: 25, source: RecruitmentSource.TikTok, interviewGeography: Geography.Singapore, slotId: 's1', category: ProviderCategory.NotAssigned, yearsOfExperience: 1, bio: 'New to professional cleaning.', results: { ...PENDING_RESULTS }, verified: false, l1Completed: false, invitationStatus: InvitationStatus.Sent, createdAt: createdAt(0) },
    { ...base, id: 'c13', name: 'Dewi Lestari', phone: '+62 0000 0013', country: 'Indonesia', city: 'Jakarta', nationality: 'Indonesia', age: 36, source: RecruitmentSource.Recruiter, referrer: 'Horizon Recruitment', interviewGeography: Geography.Overseas, slotId: 's4', category: ProviderCategory.NotAssigned, yearsOfExperience: 5, bio: 'Domestic helper experience.', results: { l1: StageResult.Failed, l2: StageResult.Pending, l3: StageResult.Pending }, verified: false, createdAt: createdAt(3) },
    { ...base, id: 'c14', name: 'Su Su Hlaing', phone: '+95 0000 0014', country: 'Myanmar', city: 'Yangon', nationality: 'Myanmar', age: 23, source: RecruitmentSource.Influencer, interviewGeography: Geography.Myanmar, slotId: 's3', category: ProviderCategory.NotAssigned, yearsOfExperience: 1, bio: 'Hotel housekeeping trainee.', results: { l1: StageResult.Passed, l2: StageResult.Pending, l3: StageResult.Pending }, verified: false, createdAt: createdAt(2) },
    { ...base, id: 'c15', name: 'Maria Lopez', phone: '+65 0000 0015', country: 'Singapore', city: 'Singapore', nationality: 'Philippines', age: 45, source: RecruitmentSource.Direct, interviewGeography: Geography.Singapore, slotId: 's7', category: ProviderCategory.NotAssigned, yearsOfExperience: 12, bio: 'Long-term live-in domestic helper.', results: { ...PENDING_RESULTS }, verified: false, cookingFrequency: CookingFrequency.Daily, createdAt: createdAt(1) },
  ];

  return {
    candidates,
    slots,
    trainers: [
      { id: 't-sg', name: 'Sarah Tan', geography: Geography.Singapore, loginId: 'trainer.sg', active: true },
      { id: 't-sg2', name: 'Daniel Lim', geography: Geography.Singapore, loginId: 'trainer.sg2', active: true },
      { id: 't-mm', name: 'Su Mon', geography: Geography.Myanmar, loginId: 'trainer.mm', active: true },
      { id: 't-os', name: 'Priya Shah', geography: Geography.Overseas, loginId: 'trainer.overseas', active: true },
    ],
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
      { candidateId: 'c5', recruiterId: 'r-a', openedAt: nowMs - 24 * HOUR_MS, deadlineAt: nowMs + 24 * HOUR_MS, startDate: day(10), aggregatorId: 'ag-2', hub: 'Tampines · East cluster', hubInstructions: 'Coordinate a stay location within the East cluster. Confirm the exact accommodation with UC before making arrangements.' },
      { candidateId: 'c2', recruiterId: 'r-a', openedAt: nowMs - 30 * HOUR_MS, deadlineAt: nowMs + 18 * HOUR_MS, startDate: day(30), aggregatorId: 'ag-1' },
      { candidateId: 'c6', recruiterId: 'r-a', openedAt: nowMs - 46 * HOUR_MS, deadlineAt: nowMs + 2 * HOUR_MS },
      { candidateId: 'c7', recruiterId: 'r-b', openedAt: nowMs - HOUR_MS, deadlineAt: nowMs + 47 * HOUR_MS },
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
