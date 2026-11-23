import { useMutation } from '@tanstack/react-query';
import { Alert, App, Button, Form, Input, Modal } from 'antd';
import { useState } from 'react';
import { changePassword } from '@/api/auth';
import { ChangePasswordInput } from '@/api/interface';
import { PASSWORD_MIN_LENGTH } from '@/domain/constant';
import { CHANGE_PASSWORD } from './constant';
import { ChangePasswordFormValues, ChangePasswordProps } from './interface';

export const ChangePassword = ({ role }: ChangePasswordProps) => {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();
  const change = useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(role, input),
    onSuccess: () => {
      message.success(CHANGE_PASSWORD.success);
      setOpen(false);
    },
  });

  return (
    <>
      <Button
        onClick={() => {
          change.reset();
          setOpen(true);
        }}
      >
        {CHANGE_PASSWORD.button}
      </Button>
      <Modal
        open={open}
        title={CHANGE_PASSWORD.title}
        okText={CHANGE_PASSWORD.submit}
        confirmLoading={change.isPending}
        destroyOnHidden
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          clearOnDestroy
          onFinish={({ currentPassword, newPassword }) => change.mutate({ currentPassword, newPassword })}
        >
          <Form.Item
            name="currentPassword"
            label={CHANGE_PASSWORD.currentLabel}
            rules={[{ required: true, message: CHANGE_PASSWORD.currentRequired }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={CHANGE_PASSWORD.newLabel}
            rules={[{ required: true, min: PASSWORD_MIN_LENGTH, message: `Use at least ${PASSWORD_MIN_LENGTH} characters` }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={CHANGE_PASSWORD.confirmLabel}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: CHANGE_PASSWORD.mismatch },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || value === getFieldValue('newPassword')
                    ? Promise.resolve()
                    : Promise.reject(new Error(CHANGE_PASSWORD.mismatch)),
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          {change.error && <Alert type="error" showIcon title={change.error.message} />}
        </Form>
      </Modal>
    </>
  );
};
