import { ASSESSMENT_STAGES, STAGE_LABEL } from './constant';
import { AssessmentStage, AuditStamp, Candidate, StageResult, StageResults } from './interface';

export const canRecordStage = (results: StageResults, stage: AssessmentStage): boolean =>
  ASSESSMENT_STAGES.slice(0, ASSESSMENT_STAGES.indexOf(stage)).every(previous => results[previous] === StageResult.Passed);

export const canConfirmVerified = (results: StageResults): boolean =>
  ASSESSMENT_STAGES.every(stage => results[stage] === StageResult.Passed);

export const hasFailedStage = (results: StageResults): boolean =>
  ASSESSMENT_STAGES.some(stage => results[stage] === StageResult.Failed);

export const getCurrentStage = (results: StageResults): AssessmentStage | undefined =>
  ASSESSMENT_STAGES.find(stage => results[stage] !== StageResult.Passed);

export const applyStageResult = (
  candidate: Candidate,
  stage: AssessmentStage,
  result: StageResult,
  stamp: AuditStamp,
): Candidate => {
  if (candidate.results[stage] === result || !canRecordStage(candidate.results, stage)) return candidate;

  const laterStages = ASSESSMENT_STAGES.slice(ASSESSMENT_STAGES.indexOf(stage) + 1);
  const results: StageResults = {
    ...candidate.results,
    [stage]: result,
    ...Object.fromEntries(laterStages.map(later => [later, StageResult.Pending])),
  };

  return {
    ...candidate,
    results,
    verified: false,
    verifiedBy: undefined,
    verifiedAt: undefined,
    attempts: [
      ...candidate.attempts,
      { stage, previous: candidate.results[stage], result, trainer: stamp.by, at: stamp.at },
    ],
    notes: [...candidate.notes, { ...stamp, text: `${STAGE_LABEL[stage]} marked ${result}` }],
  };
};

export const confirmVerified = (candidate: Candidate, stamp: AuditStamp): Candidate => {
  if (candidate.verified || !canConfirmVerified(candidate.results)) return candidate;
  return { ...candidate, verified: true, verifiedBy: stamp.by, verifiedAt: stamp.at };
};
