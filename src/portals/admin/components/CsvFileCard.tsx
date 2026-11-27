import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import { downloadCsv } from '@/shared/utils/csv';
import { CSV_FILE_CARD } from '../constant';
import { CsvFileCardProps } from '../interface';

export const CsvFileCard = ({ guide, summary, children }: CsvFileCardProps) => (
  <Card title={CSV_FILE_CARD.title} className="admin-file-card">
    <div className="admin-file-label">{CSV_FILE_CARD.formatLabel}</div>
    <div className="muted small">{CSV_FILE_CARD.formatNote}</div>
    <Flex gap={6} wrap className="admin-file-columns">
      {guide.columns.map(column => (
        <Typography.Text code key={column}>
          {column}
        </Typography.Text>
      ))}
    </Flex>
    <div className="admin-file-label">{CSV_FILE_CARD.conditionsLabel}</div>
    <ul className="admin-file-conditions">
      {guide.conditions.map(condition => (
        <li key={condition}>{condition}</li>
      ))}
    </ul>
    <Flex vertical gap={10} align="flex-start" className="admin-file-action">
      {summary && <span className="muted small">{summary}</span>}
      <Flex gap={8} wrap align="center">
        {children}
        {guide.sample && (
          <Button icon={<DownloadOutlined />} onClick={() => downloadCsv([guide.columns, ...(guide.sample?.rows ?? [])], guide.sample?.fileName ?? '')}>
            {CSV_FILE_CARD.sampleAction}
          </Button>
        )}
      </Flex>
    </Flex>
  </Card>
);
