import { useQuery } from '@tanstack/react-query';
import { listCandidates } from './candidates';
import { QUERY_KEY } from './constant';
import { listAggregators, listRecruiters } from './people';
import { listReservationEvents, listReservations } from './reservations';
import { listUpcomingSlotDays } from './slots';

export const useCandidates = () => useQuery({ queryKey: QUERY_KEY.candidates, queryFn: listCandidates });

export const useUpcomingSlotDays = () =>
  useQuery({ queryKey: QUERY_KEY.upcomingSlotDays, queryFn: listUpcomingSlotDays });

export const useRecruiters = () => useQuery({ queryKey: QUERY_KEY.recruiters, queryFn: listRecruiters });

export const useAggregators = () => useQuery({ queryKey: QUERY_KEY.aggregators, queryFn: listAggregators });

export const useReservations = () => useQuery({ queryKey: QUERY_KEY.reservations, queryFn: listReservations });

export const useReservationEvents = () =>
  useQuery({ queryKey: QUERY_KEY.reservationEvents, queryFn: listReservationEvents });
