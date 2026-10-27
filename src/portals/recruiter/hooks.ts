import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { QUERY_KEY } from '@/api/constant';
import { listAvailableCandidates, listMyReservations, reserveCandidate } from '@/api/reservations';
import { toIsoDate } from '@/domain/format';
import { isJoiningWithinNoticeWindow } from '@/domain/reservation';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { RECRUITER_MESSAGE, RECRUITER_PATH, RESERVATION_REFETCH_MS } from './constant';

export const useAvailableCandidates = () =>
  useQuery({
    queryKey: QUERY_KEY.availableCandidates,
    queryFn: listAvailableCandidates,
    refetchInterval: RESERVATION_REFETCH_MS,
  });

export const useMyReservations = (recruiterId: string) =>
  useQuery({
    queryKey: QUERY_KEY.myReservations(recruiterId),
    queryFn: () => listMyReservations(recruiterId),
    refetchInterval: RESERVATION_REFETCH_MS,
  });

export const useJoiningSoon = (recruiterId: string) => {
  const { data = [], isLoading } = useMyReservations(recruiterId);
  const today = toIsoDate();
  const joiningSoon = data
    .filter(({ reservation }) => isJoiningWithinNoticeWindow(reservation, today))
    .toSorted((a, b) => (a.reservation.startDate ?? '').localeCompare(b.reservation.startDate ?? ''));

  return { joiningSoon, isLoading };
};

export const useOpenProfile = (recruiterId: string) => {
  const navigate = useNavigate();
  const reserve = useAppMutation(
    (candidateId: string) => reserveCandidate(candidateId, recruiterId),
    RECRUITER_MESSAGE.reserved,
  );

  return {
    openProfile: (candidateId: string) =>
      reserve.mutate(candidateId, { onSuccess: () => navigate(RECRUITER_PATH.candidate(candidateId)) }),
    openingId: reserve.isPending ? reserve.variables : undefined,
  };
};
