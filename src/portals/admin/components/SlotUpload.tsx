import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Table, TableColumnsType, Upload } from 'antd';
import { useState } from 'react';
import { useInterviewCentres } from '@/api/hooks';
import { SlotImportResult, SlotImportRow } from '@/api/interface';
import { importSlots } from '@/api/slots';
import { SAVED_SLOT_OUTCOMES } from '@/domain/constant';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { downloadCsv, parseCsvRecords } from '@/shared/utils/csv';
import {
  ADMIN_MESSAGE,
  SLOT_CSV_HEADERS,
  SLOT_FAIL_CSV_FILE_NAME,
  SLOT_FAIL_CSV_HEADERS,
  SLOT_OUTCOME_LABEL,
  SLOT_UPLOAD,
} from '../constant';
import { SlotImportVariables } from '../interface';
import { CsvFileCard } from './CsvFileCard';

const failedColumns: TableColumnsType<SlotImportRow> = [
  { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber' },
  { title: 'Centre', dataIndex: 'centre', key: 'centre' },
  { title: 'Start time', dataIndex: 'startTime', key: 'startTime' },
  { title: 'End time', dataIndex: 'endTime', key: 'endTime' },
  { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
  { title: 'Reason', key: 'reason', render: (_, row) => SLOT_OUTCOME_LABEL[row.outcome] },
];

export const SlotUpload = () => {
  const { data: centres = [] } = useInterviewCentres();
  const [result, setResult] = useState<SlotImportResult>();
  const upload = useAppMutation(({ rows, fileName }: SlotImportVariables) => importSlots(rows, fileName), ADMIN_MESSAGE.slotImportCompleted);
  const failedRows = result?.rows.filter(row => !SAVED_SLOT_OUTCOMES.includes(row.outcome)) ?? [];
  const guide = { ...SLOT_UPLOAD.guide, conditions: [...SLOT_UPLOAD.guide.conditions, ...centres.map(SLOT_UPLOAD.centreCondition)] };

  return (
    <Flex vertical gap={18}>
      <CsvFileCard guide={guide}>
        <Upload
          accept=".csv,text/csv"
          showUploadList={false}
          beforeUpload={file => {
            file
              .text()
              .then(text =>
                upload.mutate(
                  {
                    rows: parseCsvRecords(text, SLOT_CSV_HEADERS).map(row => ({
                      centre: row.centre,
                      startTime: row.start_time,
                      endTime: row.end_time,
                      capacity: row.capacity,
                    })),
                    fileName: file.name,
                  },
                  { onSuccess: setResult },
                ),
              );

            return false;
          }}
        >
          <Button icon={<UploadOutlined />} loading={upload.isPending}>
            {SLOT_UPLOAD.guide.action}
          </Button>
        </Upload>
      </CsvFileCard>

      {result && (
        <Card
          title={SLOT_UPLOAD.resultTitle(result.fileName)}
          extra={
            failedRows.length ? (
              <Button
                icon={<DownloadOutlined />}
                onClick={() =>
                  downloadCsv(
                    [
                      SLOT_FAIL_CSV_HEADERS,
                      ...failedRows.map(row => [row.rowNumber, row.centre, row.startTime, row.endTime, row.capacity, SLOT_OUTCOME_LABEL[row.outcome]]),
                    ],
                    SLOT_FAIL_CSV_FILE_NAME,
                  )
                }
              >
                {SLOT_UPLOAD.failCsvAction}
              </Button>
            ) : null
          }
        >
          <Alert
            type={failedRows.length ? 'warning' : 'success'}
            showIcon
            title={SLOT_UPLOAD.resultSummary(result.counts)}
            style={{ marginBottom: failedRows.length ? 16 : 0 }}
          />
          {failedRows.length > 0 && (
            <Table rowKey="rowNumber" columns={failedColumns} dataSource={failedRows} pagination={false} size="small" />
          )}
        </Card>
      )}
    </Flex>
  );
};
