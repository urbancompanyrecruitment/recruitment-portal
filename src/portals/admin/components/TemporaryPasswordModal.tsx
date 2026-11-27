import { Button, Descriptions, Modal, Typography } from 'antd';
import { TEMPORARY_PASSWORD } from '../constant';
import { TemporaryPasswordModalProps } from '../interface';

export const TemporaryPasswordModal = ({ notice, onClose }: TemporaryPasswordModalProps) => (
  <Modal
    open={Boolean(notice)}
    title={notice && TEMPORARY_PASSWORD.title(notice.name)}
    destroyOnHidden
    onCancel={onClose}
    footer={
      <Button type="primary" onClick={onClose}>
        {TEMPORARY_PASSWORD.close}
      </Button>
    }
  >
    <Descriptions
      column={1}
      colon={false}
      size="small"
      items={[
        ...(notice?.account ? [{ key: 'account', label: TEMPORARY_PASSWORD.accountLabel, children: notice.account }] : []),
        {
          key: 'password',
          label: TEMPORARY_PASSWORD.passwordLabel,
          children: (
            <Typography.Text code copyable>
              {notice?.password}
            </Typography.Text>
          ),
        },
      ]}
    />
    <Typography.Paragraph type="secondary" className="small" style={{ margin: '12px 0 0' }}>
      {TEMPORARY_PASSWORD.note}
    </Typography.Paragraph>
  </Modal>
);
