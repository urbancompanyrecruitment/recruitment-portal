import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Table, TableColumnsType, Upload } from 'antd';
import { useState } from 'react';
import { importHubs } from '@/api/candidates';
import { HubImportResult, HubImportRow } from '@/api/interface';
import { HubRowOutcome } from '@/domain/interface';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { downloadCsv, parseCsvRecords } from '@/shared/utils/csv';
import { ADMIN_MESSAGE, CSV_FILES, HUB_CSV_HEADERS, HUB_FAIL_CSV_FILE_NAME, HUB_FAIL_CSV_HEADERS, HUB_OUTCOME_LABEL, UPLOAD_RESULT } from '../constant';
import { HubImportVariables } from '../interface';
import { CsvFileCard } from './CsvFileCard';

const failedColumns: TableColumnsType<HubImportRow> = [
  { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber', width: 80 },
  { title: 'Primary mobile', dataIndex: 'primaryPhone', key: 'primaryPhone' },
  { title: 'Hub name', dataIndex: 'hubName', key: 'hubName' },
  { title: 'Reason', key: 'reason', render: (_, row) => HUB_OUTCOME_LABEL[row.outcome] },
];

export const HubUpload = () => {
  const [result, setResult] = useState<HubImportResult>();
  const upload = useAppMutation(({ rows, fileName }: HubImportVariables) => importHubs(rows, fileName), ADMIN_MESSAGE.hubImportCompleted);
  const failedRows = result?.rows.filter(row => row.outcome !== HubRowOutcome.Updated) ?? [];

  return (
    <Flex vertical gap={18}>
      <CsvFileCard guide={CSV_FILES.hubs}>
        <Upload
          accept=".csv,text/csv"
          showUploadList={false}
          beforeUpload={file => {
            file.text().then(text =>
              upload.mutate(
                {
                  rows: parseCsvRecords(text, HUB_CSV_HEADERS).map(row => ({ primaryPhone: row.primary_mobile, hubName: row.hub_name })),
                  fileName: file.name,
                },
                { onSuccess: setResult },
              ),
            );

            return false;
          }}
        >
          <Button icon={<UploadOutlined />} loading={upload.isPending}>
            {CSV_FILES.hubs.action}
          </Button>
        </Upload>
      </CsvFileCard>

      {result && (
        <Card
          title={UPLOAD_RESULT.hubTitle(result.fileName)}
          extra={
            failedRows.length ? (
              <Button
                icon={<DownloadOutlined />}
                onClick={() =>
                  downloadCsv(
                    [HUB_FAIL_CSV_HEADERS, ...failedRows.map(row => [row.rowNumber, row.primaryPhone, row.hubName, HUB_OUTCOME_LABEL[row.outcome]])],
                    HUB_FAIL_CSV_FILE_NAME,
                  )
                }
              >
                {UPLOAD_RESULT.hubFailCsvAction}
              </Button>
            ) : null
          }
        >
          <Alert
            type={failedRows.length ? 'warning' : 'success'}
            showIcon
            title={UPLOAD_RESULT.hubSummary(result.counts)}
            style={{ marginBottom: failedRows.length ? 16 : 0 }}
          />
          {failedRows.length > 0 && <Table rowKey="rowNumber" columns={failedColumns} dataSource={failedRows} pagination={false} size="small" />}
        </Card>
      )}
    </Flex>
  );
};
