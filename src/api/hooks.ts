import { useQuery } from '@tanstack/react-query';
import { Geography } from '@/domain/interface';
import { listCandidates } from './candidates';
import { QUERY_KEY } from './constant';
import { listAggregators, listRecruiters, listTrainers } from './people';
import { listReservationEvents, listReservations } from './reservations';
import { listSlots } from './slots';

export const useCandidates = (geography?: Geography) =>
  useQuery({ queryKey: QUERY_KEY.candidates(geography), queryFn: () => listCandidates(geography) });

export const useSlots = () => useQuery({ queryKey: QUERY_KEY.slots, queryFn: listSlots });

export const useTrainers = () => useQuery({ queryKey: QUERY_KEY.trainers, queryFn: listTrainers });

export const useRecruiters = () => useQuery({ queryKey: QUERY_KEY.recruiters, queryFn: listRecruiters });

export const useAggregators = () => useQuery({ queryKey: QUERY_KEY.aggregators, queryFn: listAggregators });

export const useReservations = () => useQuery({ queryKey: QUERY_KEY.reservations, queryFn: listReservations });

export const useReservationEvents = () =>
  useQuery({ queryKey: QUERY_KEY.reservationEvents, queryFn: listReservationEvents });
