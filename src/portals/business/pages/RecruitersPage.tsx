import { Button, Card, Col, Flex, Form, Input, Row, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useCandidates, useRecruiters, useReservationEvents } from '@/api/hooks';
import { RecruiterInput } from '@/api/interface';
import { createRecruiter, toggleRecruiterAccess } from '@/api/people';
import { formatDateTime } from '@/domain/format';
import { ReservationEvent } from '@/domain/interface';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { CandidateAvatar, Notice, PageHeader } from '@/shared/components/ui';
import { BUSINESS_MESSAGE, EMPTY_VALUE, RESERVATION_EVENT_TAG, TABLE_PAGE_SIZE } from '../constant';

export const RecruitersPage = () => {
  const [form] = Form.useForm<RecruiterInput>();
  const { data: recruiters = [] } = useRecruiters();
  const { data: events = [], isLoading } = useReservationEvents();
  const { data: candidates = [] } = useCandidates();
  const addRecruiter = useAppMutation(createRecruiter, BUSINESS_MESSAGE.recruiterCreated);
  const toggleAccess = useAppMutation(toggleRecruiterAccess, BUSINESS_MESSAGE.recruiterAccessUpdated);

  const columns: TableColumnsType<ReservationEvent> = [
    { title: 'When', key: 'at', render: (_, event) => formatDateTime(event.at) },
    {
      title: 'Recruiter',
      key: 'recruiter',
      render: (_, event) => recruiters.find(recruiter => recruiter.id === event.recruiterId)?.name ?? EMPTY_VALUE,
    },
    {
      title: 'Candidate',
      key: 'candidate',
      render: (_, event) => candidates.find(candidate => candidate.id === event.candidateId)?.name ?? EMPTY_VALUE,
    },
    {
      title: 'Event',
      key: 'type',
      render: (_, event) => (
        <Tag color={RESERVATION_EVENT_TAG[event.type].color}>{RESERVATION_EVENT_TAG[event.type].label}</Tag>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Recruiter access" subtitle="Issue approved accounts and suspend access when required." />
      <Flex vertical gap={18}>
        <Row gutter={[18, 18]}>
          <Col xs={24} lg={10}>
            <Card title="Create recruiter" style={{ height: '100%' }}>
              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={({ name, company, loginId }) =>
                  addRecruiter.mutate(
                    { name: name.trim(), company: company.trim(), loginId: loginId.trim() },
                    { onSuccess: () => form.resetFields() },
                  )
                }
              >
                <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="Recruiter full name" />
                </Form.Item>
                <Form.Item name="company" label="Organisation" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="Recruitment agency" />
                </Form.Item>
                <Form.Item name="loginId" label="Login ID" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="e.g. recruiter.c" />
                </Form.Item>
                <Notice>
                  This mock uses the shared demo password. Production credentials will be issued by the backend.
                </Notice>
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
                          {recruiter.company} · {recruiter.loginId}
                        </div>
                      </div>
                    </Flex>
                    <Flex align="center" gap={8}>
                      {recruiter.active ? <Tag color="success">Active</Tag> : <Tag color="error">Suspended</Tag>}
                      <Button
                        size="small"
                        danger={recruiter.active}
                        aria-label={`${action} ${recruiter.name}`}
                        loading={toggleAccess.isPending && toggleAccess.variables === recruiter.id}
                        onClick={() => toggleAccess.mutate(recruiter.id)}
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
            dataSource={events}
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
