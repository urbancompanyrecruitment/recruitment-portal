import { Button, Card, Col, Form, Input, Row } from 'antd';
import { useState } from 'react';
import { RecruiterInput } from '@/api/interface';
import { createRecruiter } from '@/api/people';
import { Notice } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { ADMIN_MESSAGE, CREATE_RECRUITER } from '../constant';
import { TemporaryPasswordNotice } from '../interface';
import { TemporaryPasswordModal } from './TemporaryPasswordModal';

export const CreateRecruiterForm = () => {
  const [form] = Form.useForm<RecruiterInput>();
  const [notice, setNotice] = useState<TemporaryPasswordNotice>();
  const addRecruiter = useAppMutation(createRecruiter, ADMIN_MESSAGE.recruiterCreated);

  return (
    <Card title={CREATE_RECRUITER.cardTitle}>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={({ name, company, email }) =>
          addRecruiter.mutate(
            { name: name.trim(), company: company.trim(), email: email.trim().toLowerCase() },
            {
              onSuccess: created => {
                form.resetFields();
                setNotice({ name: created.recruiter.name, account: created.recruiter.email, password: created.temporaryPassword });
              },
            },
          )
        }
      >
        <Row gutter={18}>
          <Col xs={24} md={8}>
            <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true }]}>
              <Input placeholder="Recruiter full name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="company" label="Organisation" rules={[{ required: true, whitespace: true }]}>
              <Input placeholder="Recruitment agency" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
              <Input inputMode="email" placeholder="recruiter@agency.sg" />
            </Form.Item>
          </Col>
        </Row>
        <Notice>{CREATE_RECRUITER.note}</Notice>
        <Button type="primary" htmlType="submit" loading={addRecruiter.isPending}>
          {CREATE_RECRUITER.submit}
        </Button>
      </Form>
      <TemporaryPasswordModal notice={notice} onClose={() => setNotice(undefined)} />
    </Card>
  );
};
