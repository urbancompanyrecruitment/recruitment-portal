import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Divider, Flex, Select, Timeline, Typography } from 'antd';
import { useState } from 'react';
import { recordStageResult } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { canRecordStage } from '@/domain/assessment';
import { ASSESSMENT_STAGES, STAGE_DESCRIPTION, STAGE_LABEL } from '@/domain/constant';
import { formatDateTime } from '@/domain/format';
import { StageResults } from '@/domain/interface';
import { ResultTag } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { ATTEMPT_COLOR, RESULT_OPTIONS, SUCCESS_MESSAGE } from '../constant';
import { CandidatePanelProps, StageResultInput } from '../interface';

export const AssessmentPanel = ({ candidate, trainerName }: CandidatePanelProps) => {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Partial<StageResults>>({});
  const saveResult = useAppMutation(
    ({ stage, result }: StageResultInput) => recordStageResult(candidate.id, stage, result, trainerName),
    SUCCESS_MESSAGE.resultSaved,
  );
  const history = candidate.attempts.toSorted((a, b) => b.at.localeCompare(a.at));

  return (
    <Card title="Assessment results">
      <div className="stage-grid">
        {ASSESSMENT_STAGES.map(stage => {
          const unlocked = canRecordStage(candidate.results, stage);
          const selected = drafts[stage] ?? candidate.results[stage];
          return (
            <div
              key={stage}
              role="group"
              aria-label={`${STAGE_LABEL[stage]} ${STAGE_DESCRIPTION[stage]}`}
              className={unlocked ? 'stage-box' : 'stage-box stage-box-locked'}
            >
              <Flex justify="space-between" align="center" gap={8}>
                <Typography.Text strong>{STAGE_LABEL[stage]}</Typography.Text>
                <ResultTag result={candidate.results[stage]} />
              </Flex>
              <div className="muted small">{STAGE_DESCRIPTION[stage]}</div>
              <Select
                aria-label={`${STAGE_LABEL[stage]} result`}
                value={selected}
                options={RESULT_OPTIONS}
                disabled={!unlocked}
                onChange={result => setDrafts(current => ({ ...current, [stage]: result }))}
              />
              <Button
                block
                disabled={!unlocked || selected === candidate.results[stage]}
                loading={saveResult.isPending && saveResult.variables?.stage === stage}
                onClick={() =>
                  saveResult.mutate(
                    { stage, result: selected },
                    {
                      onSuccess: updated => {
                        queryClient.setQueryData(QUERY_KEY.candidate(candidate.id), updated);
                        setDrafts({});
                      },
                    },
                  )
                }
              >
                Save result
              </Button>
            </div>
          );
        })}
      </div>
      <Typography.Paragraph type="secondary" className="small" style={{ margin: '14px 0 0' }}>
        L1 must pass before L2, and L2 before L3. Changing an earlier result resets later results and verification.
      </Typography.Paragraph>
      <Divider />
      <Typography.Title level={5}>Assessment history</Typography.Title>
      {!history.length && <Typography.Text type="secondary">No results recorded yet.</Typography.Text>}
      {!!history.length && (
        <Timeline
          items={history.map(attempt => ({
            key: `${attempt.stage}-${attempt.at}`,
            color: ATTEMPT_COLOR[attempt.result],
            content: (
              <div>
                <Typography.Text strong>{STAGE_LABEL[attempt.stage]}</Typography.Text>{' '}
                {attempt.previous} → {attempt.result}
                <div className="muted small">
                  {attempt.trainer} · {formatDateTime(attempt.at)}
                </div>
              </div>
            ),
          }))}
        />
      )}
    </Card>
  );
};
