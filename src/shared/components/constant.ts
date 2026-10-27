import { StageResult } from '@/domain/interface';

export const CANDIDATE_AVATAR_STYLE = { background: '#ece4f9', color: '#7039bc', fontWeight: 700, flexShrink: 0 };

export const RESULT_TAG_COLOR: Record<StageResult, string | undefined> = {
  [StageResult.Passed]: 'success',
  [StageResult.Failed]: 'error',
  [StageResult.Pending]: undefined,
};
