import { useQuery } from '@tanstack/react-query';
import { listCandidates } from './candidates';
import { QUERY_KEY } from './constant';
import { listRecruiters } from './people';
import { listReservations } from './reservations';
import { listInterviewCities, listUpcomingSlotDays } from './slots';

export const useCandidates = () => useQuery({ queryKey: QUERY_KEY.candidates, queryFn: () => listCandidates() });

export const useInterviewCities = () =>
  useQuery({ queryKey: QUERY_KEY.interviewCities, queryFn: listInterviewCities, staleTime: Infinity });

export const useUpcomingSlotDays = () =>
  useQuery({ queryKey: QUERY_KEY.upcomingSlotDays, queryFn: listUpcomingSlotDays });

export const useRecruiters = () => useQuery({ queryKey: QUERY_KEY.recruiters, queryFn: listRecruiters });

export const useReservations = () => useQuery({ queryKey: QUERY_KEY.reservations, queryFn: listReservations });
