import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Table, TableColumnsType, Upload } from 'antd';
import { useState } from 'react';
import { importVerifiedCandidates } from '@/api/candidates';
import { ImportRow, VerifiedImportResult } from '@/api/interface';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { downloadCsv, parseCsvRecords } from '@/shared/utils/csv';
import {
  ADMIN_MESSAGE,
  CSV_FILES,
  FAIL_CSV_FILE_NAME,
  FAIL_CSV_HEADERS,
  IMPORT_OUTCOME_LABEL,
  PROCESSED_IMPORT_OUTCOMES,
  UPLOAD_RESULT,
  VERIFIED_CSV_HEADERS,
} from '../constant';
import { ImportVariables } from '../interface';
import { CsvFileCard } from './CsvFileCard';

const failedColumns: TableColumnsType<ImportRow> = [
  { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber', width: 80 },
  { title: 'Primary mobile', dataIndex: 'primaryPhone', key: 'primaryPhone' },
  { title: 'Verified', dataIndex: 'verified', key: 'verified' },
  { title: 'Reason', key: 'reason', render: (_, row) => IMPORT_OUTCOME_LABEL[row.outcome] },
];

export const VerifiedUpload = () => {
  const [result, setResult] = useState<VerifiedImportResult>();
  const upload = useAppMutation(
    ({ rows, fileName }: ImportVariables) => importVerifiedCandidates(rows, fileName),
    ADMIN_MESSAGE.importCompleted,
  );
  const failedRows = result?.rows.filter(row => !PROCESSED_IMPORT_OUTCOMES.includes(row.outcome)) ?? [];

  return (
    <Flex vertical gap={18}>
      <CsvFileCard guide={CSV_FILES.verified}>
        <Upload
          accept=".csv,text/csv"
          showUploadList={false}
          beforeUpload={file => {
            file.text().then(text =>
              upload.mutate(
                {
                  rows: parseCsvRecords(text, VERIFIED_CSV_HEADERS).map(row => ({ primaryPhone: row.primary_mobile, verified: row.verified })),
                  fileName: file.name,
                },
                { onSuccess: setResult },
              ),
            );

            return false;
          }}
        >
          <Button icon={<UploadOutlined />} loading={upload.isPending}>
            {CSV_FILES.verified.action}
          </Button>
        </Upload>
      </CsvFileCard>

      {result && (
        <Card
          title={UPLOAD_RESULT.verifiedTitle(result.fileName)}
          extra={
            failedRows.length ? (
              <Button
                icon={<DownloadOutlined />}
                onClick={() =>
                  downloadCsv(
                    [FAIL_CSV_HEADERS, ...failedRows.map(row => [row.rowNumber, row.primaryPhone, row.verified, IMPORT_OUTCOME_LABEL[row.outcome]])],
                    FAIL_CSV_FILE_NAME,
                  )
                }
              >
                {UPLOAD_RESULT.failCsvAction}
              </Button>
            ) : null
          }
        >
          <Alert
            type={failedRows.length ? 'warning' : 'success'}
            showIcon
            title={UPLOAD_RESULT.verifiedSummary(result.counts)}
            style={{ marginBottom: failedRows.length ? 16 : 0 }}
          />
          {failedRows.length > 0 && <Table rowKey="rowNumber" columns={failedColumns} dataSource={failedRows} pagination={false} size="small" />}
        </Card>
      )}
    </Flex>
  );
};
