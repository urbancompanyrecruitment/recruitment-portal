import { useQuery } from '@tanstack/react-query';
import { listCandidates } from './candidates';
import { QUERY_KEY } from './constant';
import { listAdmins, listRecruiters } from './people';
import { listReservations } from './reservations';
import { listInterviewCentres, listInterviewCities, listUpcomingSlotDays } from './slots';

export const useCandidates = () => useQuery({ queryKey: QUERY_KEY.candidates, queryFn: () => listCandidates() });

export const useInterviewCities = (country?: string) =>
  useQuery({ queryKey: QUERY_KEY.interviewCities(country), queryFn: () => listInterviewCities(country), staleTime: Infinity });

export const useUpcomingSlotDays = () =>
  useQuery({ queryKey: QUERY_KEY.upcomingSlotDays, queryFn: listUpcomingSlotDays });

export const useInterviewCentres = () =>
  useQuery({ queryKey: QUERY_KEY.interviewCentres, queryFn: listInterviewCentres, staleTime: Infinity });

export const useRecruiters = () => useQuery({ queryKey: QUERY_KEY.recruiters, queryFn: listRecruiters });

export const useAdminAccounts = (enabled: boolean) =>
  useQuery({ queryKey: QUERY_KEY.adminAccounts, queryFn: listAdmins, enabled });

export const useReservations = () => useQuery({ queryKey: QUERY_KEY.reservations, queryFn: listReservations });
