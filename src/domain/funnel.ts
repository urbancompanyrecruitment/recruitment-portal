import dayjs from 'dayjs';
import { ASSESSMENT_STAGES, FUNNEL_WEEK_DAYS } from './constant';
import { Candidate, ChannelFunnelRow, StagePassRate, StageResult } from './interface';

export const buildChannelFunnel = (candidates: Candidate[], weekStart: string): ChannelFunnelRow[] => {
  const start = dayjs(weekStart).startOf('day');
  const end = start.add(FUNNEL_WEEK_DAYS, 'day');
  const cohort = candidates.filter(
    candidate => !dayjs(candidate.createdAt).isBefore(start) && dayjs(candidate.createdAt).isBefore(end),
  );
  const sources = [...new Set(cohort.map(candidate => candidate.source))];

  return sources.map(source => {
    const channel = cohort.filter(candidate => candidate.source === source);
    const selected = channel.filter(candidate => candidate.verified).length;
    const passRates = Object.fromEntries(
      ASSESSMENT_STAGES.map(stage => [
        stage,
        {
          passed: channel.filter(candidate => candidate.results[stage] === StageResult.Passed).length,
          assessed: channel.filter(candidate => candidate.results[stage] !== StageResult.Pending).length,
        },
      ]),
    ) as ChannelFunnelRow['passRates'];

    return {
      source,
      signups: channel.length,
      passRates,
      selected,
      conversion: Math.round((selected / channel.length) * 100),
    };
  });
};

export const formatPassRate = ({ passed, assessed }: StagePassRate): string =>
  assessed ? `${Math.round((passed / assessed) * 100)}% (${passed}/${assessed})` : '—';
