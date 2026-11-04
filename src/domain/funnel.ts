import dayjs from 'dayjs';
import { FUNNEL_WEEK_DAYS } from './constant';
import { Candidate, ChannelFunnelRow, Reservation } from './interface';

export const buildChannelFunnel = (
  candidates: Candidate[],
  reservations: Reservation[],
  weekStart: string,
): ChannelFunnelRow[] => {
  const start = dayjs(weekStart).startOf('day');
  const end = start.add(FUNNEL_WEEK_DAYS, 'day');
  const cohort = candidates.filter(
    candidate => !dayjs(candidate.createdAt).isBefore(start) && dayjs(candidate.createdAt).isBefore(end),
  );
  const placedIds = new Set(reservations.filter(item => item.aggregatorId).map(item => item.candidateId));
  const sources = [...new Set(cohort.map(candidate => candidate.source))];

  return sources.map(source => {
    const channel = cohort.filter(candidate => candidate.source === source);
    const verified = channel.filter(candidate => candidate.verified).length;

    return {
      source,
      signups: channel.length,
      withSingaporePhone: channel.filter(candidate => Boolean(candidate.singaporePhone)).length,
      verified,
      placed: channel.filter(candidate => placedIds.has(candidate.id)).length,
      conversion: Math.round((verified / channel.length) * 100),
    };
  });
};
