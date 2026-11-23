import { Form, Modal, Typography } from 'antd';
import { reschedulePartnerSlot } from '@/api/candidates';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { SlotPicker } from '@/shared/registration/SlotPicker';
import { PARTNER_RESCHEDULE } from '../constant';
import { RescheduleFormValues, RescheduleModalProps } from '../interface';

export const RescheduleModal = ({ open, country, onClose }: RescheduleModalProps) => {
  const [form] = Form.useForm<RescheduleFormValues>();
  const reschedule = useAppMutation(reschedulePartnerSlot, PARTNER_RESCHEDULE.success);

  return (
    <Modal
      open={open}
      title={PARTNER_RESCHEDULE.title}
      okText={PARTNER_RESCHEDULE.submit}
      confirmLoading={reschedule.isPending}
      destroyOnHidden
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      <Typography.Paragraph type="secondary">{PARTNER_RESCHEDULE.note}</Typography.Paragraph>
      <Form form={form} layout="vertical" requiredMark={false} clearOnDestroy onFinish={values => reschedule.mutate(values, { onSuccess: onClose })}>
        <SlotPicker country={country} />
      </Form>
    </Modal>
  );
};
