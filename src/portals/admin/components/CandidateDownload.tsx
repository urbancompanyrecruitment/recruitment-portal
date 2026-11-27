import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import { useState } from 'react';
import { exportCandidatesCsv, exportOpsLeadUploadCsv } from '@/api/candidates';
import { useCandidates } from '@/api/hooks';
import { CandidateFilters } from '@/api/interface';
import { PartnerState } from '@/domain/interface';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { downloadTextFile } from '@/shared/utils/csv';
import { CSV_FILES, DOWNLOAD_PAGE, OPS_UPLOAD_FILE_NAME, SIGNUP_EXPORT_FILE_NAME } from '../constant';
import { CandidateDownloadProps } from '../interface';
import { filterCandidates } from '../utils';
import { CsvFileCard } from './CsvFileCard';
import { PartnerFilters } from './PartnerFilters';

export const CandidateDownload = ({ file }: CandidateDownloadProps) => {
  const { data: candidates = [] } = useCandidates();
  const [filters, setFilters] = useState<CandidateFilters>({});
  const isOpsUpload = file === 'opsUpload';
  const exportCsv = useAppMutation(() => (isOpsUpload ? exportOpsLeadUploadCsv(filters) : exportCandidatesCsv(filters)));
  const matching = filterCandidates(candidates, filters);
  const included = isOpsUpload
    ? matching.filter(candidate => candidate.hasSingaporePhone && candidate.state !== PartnerState.VerificationFailed).length
    : matching.length;

  return (
    <Flex vertical gap={18}>
      <Card>
        <PartnerFilters value={filters} onChange={setFilters} />
        <div className="muted small" style={{ marginTop: 12 }}>
          {DOWNLOAD_PAGE.filtersNote}
        </div>
      </Card>
      <CsvFileCard guide={CSV_FILES[file]} summary={DOWNLOAD_PAGE.summary(included, matching.length, isOpsUpload)}>
        <Button
          icon={<DownloadOutlined />}
          disabled={!included}
          loading={exportCsv.isPending}
          onClick={() =>
            exportCsv.mutate(undefined, {
              onSuccess: csv => downloadTextFile(csv, isOpsUpload ? OPS_UPLOAD_FILE_NAME : SIGNUP_EXPORT_FILE_NAME),
            })
          }
        >
          {CSV_FILES[file].action}
        </Button>
      </CsvFileCard>
    </Flex>
  );
};
