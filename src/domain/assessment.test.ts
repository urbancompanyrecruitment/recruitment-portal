import { createSeedDb } from '@/mocks/seed';
import {
  applyStageResult,
  canConfirmVerified,
  canRecordStage,
  confirmVerified,
  getCurrentStage,
  hasFailedStage,
} from './assessment';
import { PENDING_RESULTS } from './constant';
import { AssessmentStage, Candidate, StageResult } from './interface';

const stamp = { id: 'stamp-1', by: 'Sarah Tan', at: '2026-10-27T10:00:00.000Z' };
const candidateById = (id: string): Candidate => createSeedDb().candidates.find(candidate => candidate.id === id)!;

describe('canRecordStage', () => {
  it('allows L1 at any time', () => {
    expect(canRecordStage(PENDING_RESULTS, AssessmentStage.L1)).toBe(true);
  });

  it('blocks L2 until L1 passes and L3 until L2 passes', () => {
    expect(canRecordStage(PENDING_RESULTS, AssessmentStage.L2)).toBe(false);
    expect(canRecordStage({ ...PENDING_RESULTS, l1: StageResult.Passed }, AssessmentStage.L2)).toBe(true);
    expect(canRecordStage({ ...PENDING_RESULTS, l1: StageResult.Passed }, AssessmentStage.L3)).toBe(false);
    expect(canRecordStage({ l1: StageResult.Passed, l2: StageResult.Failed, l3: StageResult.Pending }, AssessmentStage.L3)).toBe(false);
  });
});

describe('verification helpers', () => {
  it('requires all three stages to pass', () => {
    expect(canConfirmVerified({ l1: StageResult.Passed, l2: StageResult.Passed, l3: StageResult.Pending })).toBe(false);
    expect(canConfirmVerified({ l1: StageResult.Passed, l2: StageResult.Passed, l3: StageResult.Passed })).toBe(true);
  });

  it('detects failures and the current stage', () => {
    expect(hasFailedStage({ l1: StageResult.Passed, l2: StageResult.Failed, l3: StageResult.Pending })).toBe(true);
    expect(getCurrentStage({ l1: StageResult.Passed, l2: StageResult.Pending, l3: StageResult.Pending })).toBe(AssessmentStage.L2);
    expect(getCurrentStage({ l1: StageResult.Passed, l2: StageResult.Passed, l3: StageResult.Passed })).toBeUndefined();
  });
});

describe('applyStageResult', () => {
  it('records the result with an attempt and an audit note', () => {
    const updated = applyStageResult(candidateById('c11'), AssessmentStage.L3, StageResult.Passed, stamp);

    expect(updated.results.l3).toBe(StageResult.Passed);
    expect(updated.attempts.at(-1)).toEqual({
      stage: AssessmentStage.L3,
      previous: StageResult.Pending,
      result: StageResult.Passed,
      trainer: 'Sarah Tan',
      at: stamp.at,
    });
    expect(updated.notes.at(-1)?.text).toBe('L3 marked Passed');
  });

  it('resets later stages and verification when an earlier result changes', () => {
    const updated = applyStageResult(candidateById('c1'), AssessmentStage.L1, StageResult.Failed, stamp);

    expect(updated.results).toEqual({ l1: StageResult.Failed, l2: StageResult.Pending, l3: StageResult.Pending });
    expect(updated.verified).toBe(false);
    expect(updated.verifiedBy).toBeUndefined();
  });

  it('ignores locked stages and unchanged results', () => {
    const pending = candidateById('c12');

    expect(applyStageResult(pending, AssessmentStage.L2, StageResult.Passed, stamp)).toBe(pending);
    expect(applyStageResult(pending, AssessmentStage.L1, StageResult.Pending, stamp)).toBe(pending);
  });
});

describe('confirmVerified', () => {
  it('verifies only when every stage passed', () => {
    const allPassed = applyStageResult(candidateById('c11'), AssessmentStage.L3, StageResult.Passed, stamp);

    expect(confirmVerified(candidateById('c11'), stamp).verified).toBe(false);
    expect(confirmVerified(allPassed, stamp)).toMatchObject({ verified: true, verifiedBy: 'Sarah Tan', verifiedAt: stamp.at });
  });
});
