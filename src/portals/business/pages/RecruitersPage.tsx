import { Alert, Button, Card, Col, Flex, Form, Input, Row, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useRecruiters, useReservations } from '@/api/hooks';
import { RecruiterInput } from '@/api/interface';
import { createRecruiter, setRecruiterStatus } from '@/api/people';
import { formatDateTime } from '@/domain/format';
import { AdminReservation, Recruiter, RecruiterStatus } from '@/domain/interface';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { CandidateAvatar, Notice, PageHeader } from '@/shared/components/ui';
import {
  BUSINESS_MESSAGE,
  INACTIVE_REASON_LABEL,
  LOCK_STATE_TAG,
  TABLE_PAGE_SIZE,
  TEMPORARY_PASSWORD,
} from '../constant';
import { TemporaryPasswordNotice } from '../interface';

export const RecruitersPage = () => {
  const [form] = Form.useForm<RecruiterInput>();
  const [notice, setNotice] = useState<TemporaryPasswordNotice>();
  const { data: recruiters = [] } = useRecruiters();
  const { data: reservations = [], isLoading } = useReservations();
  const addRecruiter = useAppMutation(createRecruiter, BUSINESS_MESSAGE.recruiterCreated);
  const toggleAccess = useAppMutation(
    (recruiter: Recruiter) => setRecruiterStatus(recruiter.id, recruiter.active ? RecruiterStatus.Suspended : RecruiterStatus.Active),
    BUSINESS_MESSAGE.recruiterAccessUpdated,
  );

  const columns: TableColumnsType<AdminReservation> = [
    { title: 'Locked at', key: 'lockedAt', render: (_, lock) => formatDateTime(lock.lockedAt) },
    {
      title: 'Recruiter',
      key: 'recruiter',
      render: (_, lock) => (
        <>
          <div>{lock.recruiterName}</div>
          <div className="muted small">{lock.recruiterCompany}</div>
        </>
      ),
    },
    { title: 'Partner', dataIndex: 'candidateName', key: 'candidate' },
    {
      title: 'State',
      key: 'state',
      render: (_, lock) => (
        <>
          <Tag color={LOCK_STATE_TAG[lock.state].color}>{LOCK_STATE_TAG[lock.state].label}</Tag>
          {lock.inactiveReason && <div className="muted small">{INACTIVE_REASON_LABEL[lock.inactiveReason]}</div>}
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Recruiter access" subtitle="Issue approved accounts and suspend access when required." />
      <Flex vertical gap={18}>
        {notice && (
          <Alert
            type="success"
            showIcon
            closable
            onClose={() => setNotice(undefined)}
            title={notice.title}
            description={
              <>
                <Typography.Text code copyable>
                  {notice.password}
                </Typography.Text>
                <div className="small muted" style={{ marginTop: 6 }}>
                  {TEMPORARY_PASSWORD.note}
                </div>
              </>
            }
          />
        )}
        <Row gutter={[18, 18]}>
          <Col xs={24} lg={10}>
            <Card title="Create recruiter" style={{ height: '100%' }}>
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
                        setNotice({ title: TEMPORARY_PASSWORD.recruiterTitle(created.recruiter.name), password: created.temporaryPassword });
                      },
                    },
                  )
                }
              >
                <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="Recruiter full name" />
                </Form.Item>
                <Form.Item name="company" label="Organisation" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="Recruitment agency" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                  <Input placeholder="recruiter@agency.sg" />
                </Form.Item>
                <Notice>The recruiter signs in with this email and the temporary password shown after creation.</Notice>
                <Button type="primary" htmlType="submit" loading={addRecruiter.isPending}>
                  Create approved recruiter
                </Button>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card title="Recruiters" style={{ height: '100%' }}>
              {recruiters.map(recruiter => {
                const action = recruiter.active ? 'Suspend' : 'Activate';
                return (
                  <Flex
                    key={recruiter.id}
                    justify="space-between"
                    align="center"
                    gap={12}
                    wrap
                    className="business-directory-row"
                  >
                    <Flex align="center" gap={12}>
                      <CandidateAvatar name={recruiter.name} size={36} />
                      <div>
                        <Typography.Text strong>{recruiter.name}</Typography.Text>
                        <div className="muted small">
                          {recruiter.company} · {recruiter.email}
                        </div>
                      </div>
                    </Flex>
                    <Flex align="center" gap={8}>
                      {recruiter.active ? <Tag color="success">Active</Tag> : <Tag color="error">Suspended</Tag>}
                      <Button
                        size="small"
                        danger={recruiter.active}
                        aria-label={`${action} ${recruiter.name}`}
                        loading={toggleAccess.isPending && toggleAccess.variables?.id === recruiter.id}
                        onClick={() => toggleAccess.mutate(recruiter)}
                      >
                        {action}
                      </Button>
                    </Flex>
                  </Flex>
                );
              })}
            </Card>
          </Col>
        </Row>

        <Card title="Profile access log" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={reservations}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No recruiter has opened a profile yet.' }}
          />
        </Card>
      </Flex>
    </>
  );
};
