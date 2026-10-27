import { Button, Card, Divider, Flex, Select, Typography } from 'antd';
import { useState } from 'react';
import { confirmCandidateVerified, updateCandidateCategory } from '@/api/candidates';
import { canConfirmVerified } from '@/domain/assessment';
import { ASSIGNABLE_CATEGORIES } from '@/domain/constant';
import { formatDate } from '@/domain/format';
import { Candidate, ProviderCategory } from '@/domain/interface';
import { Notice, VerificationTag } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { CATEGORY_OPTIONS, SUCCESS_MESSAGE } from '../constant';
import { CandidatePanelProps } from '../interface';

export const VerificationPanel = ({ candidate, trainerName }: CandidatePanelProps) => {
  const [category, setCategory] = useState(ASSIGNABLE_CATEGORIES.find(item => item === candidate.category));
  const saveCategory = useAppMutation(
    (next: ProviderCategory) => updateCandidateCategory(candidate.id, next),
    SUCCESS_MESSAGE.categorySaved,
  );
  const confirm = useAppMutation<void, Candidate>(
    () => confirmCandidateVerified(candidate.id, trainerName),
    SUCCESS_MESSAGE.verified,
  );

  return (
    <Card title="Provider category">
      <Typography.Paragraph type="secondary" className="small">
        The category recruiters will see on this professional&apos;s profile.
      </Typography.Paragraph>
      <Flex gap={8}>
        <Select
          aria-label="Provider category"
          placeholder="Choose a category"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          disabled={!category || category === candidate.category}
          loading={saveCategory.isPending}
          onClick={() => category && saveCategory.mutate(category)}
        >
          Save
        </Button>
      </Flex>
      <Divider />
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          UC verification
        </Typography.Title>
        <VerificationTag verified={candidate.verified} />
      </Flex>
      <Typography.Paragraph type="secondary" className="small" style={{ margin: '10px 0 16px' }}>
        All three stages must be Passed before final trainer confirmation.
      </Typography.Paragraph>
      <Button
        type="primary"
        block
        disabled={!canConfirmVerified(candidate.results) || candidate.verified}
        loading={confirm.isPending}
        onClick={() => confirm.mutate()}
      >
        Confirm UC Verified
      </Button>
      {candidate.verified && (
        <Notice tone="success" style={{ margin: '16px 0 0' }}>
          Confirmed by {candidate.verifiedBy} on {formatDate(candidate.verifiedAt)}
        </Notice>
      )}
    </Card>
  );
};
