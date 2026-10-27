import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  TableColumnsType,
  Tag,
  TimePicker,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCandidates, useSlots, useTrainers } from '@/api/hooks';
import { TrainerInput } from '@/api/interface';
import { createTrainer } from '@/api/people';
import { createSlot, toggleSlotAvailability } from '@/api/slots';
import { DATE_FORMAT, GEOGRAPHIES } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { InterviewSlot } from '@/domain/interface';
import { countSlotBookings, formatSlot } from '@/domain/slot';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { CandidateAvatar, Notice, PageHeader } from '@/shared/components/ui';
import {
  BUSINESS_MESSAGE,
  DEFAULT_SLOT_CAPACITY,
  EMPTY_VALUE,
  SLOT_MINUTE_STEP,
  TABLE_PAGE_SIZE,
  TIME_FORMAT,
} from '../constant';
import { SlotFormValues } from '../interface';

export const TrainersPage = () => {
  const [trainerForm] = Form.useForm<TrainerInput>();
  const [slotForm] = Form.useForm<SlotFormValues>();
  const { data: trainers = [] } = useTrainers();
  const { data: slots = [], isLoading } = useSlots();
  const { data: candidates = [] } = useCandidates();
  const addTrainer = useAppMutation(createTrainer, BUSINESS_MESSAGE.trainerCreated);
  const publishSlot = useAppMutation(createSlot, BUSINESS_MESSAGE.slotPublished);
  const toggleSlot = useAppMutation(toggleSlotAvailability, BUSINESS_MESSAGE.slotAvailabilityUpdated);

  const columns: TableColumnsType<InterviewSlot> = [
    { title: 'Date / time', key: 'date', render: (_, slot) => formatSlot(slot) },
    {
      title: 'Trainer / route',
      key: 'trainer',
      render: (_, slot) => (
        <>
          <div>{trainers.find(trainer => trainer.id === slot.trainerId)?.name ?? EMPTY_VALUE}</div>
          <div className="muted small">{slot.geography}</div>
        </>
      ),
    },
    {
      title: 'Centre',
      key: 'centre',
      render: (_, slot) => (
        <>
          <div>{slot.centre}</div>
          <div className="muted small">{slot.address}</div>
        </>
      ),
    },
    {
      title: 'Bookings',
      key: 'bookings',
      render: (_, slot) => `${countSlotBookings(candidates, slot.id)} / ${slot.capacity}`,
    },
    {
      title: 'Availability',
      key: 'availability',
      render: (_, slot) => (
        <Flex gap={8} align="center">
          {!slot.isOpen && <Tag>Closed</Tag>}
          <Button
            size="small"
            loading={toggleSlot.isPending && toggleSlot.variables === slot.id}
            onClick={() => toggleSlot.mutate(slot.id)}
          >
            {slot.isOpen ? 'Close availability' : 'Reopen availability'}
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Trainer profiles & calendars"
        subtitle="Create geography-based trainer accounts and publish available sessions."
      />
      <Flex vertical gap={18}>
        <Row gutter={[18, 18]}>
          <Col xs={24} lg={10}>
            <Card title="Add a trainer" style={{ height: '100%' }}>
              <Form
                form={trainerForm}
                layout="vertical"
                requiredMark={false}
                onFinish={({ name, loginId, geography }) =>
                  addTrainer.mutate(
                    { name: name.trim(), loginId: loginId.trim(), geography },
                    { onSuccess: () => trainerForm.resetFields() },
                  )
                }
              >
                <Form.Item name="name" label="Trainer name" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="Full name" />
                </Form.Item>
                <Form.Item name="loginId" label="Login ID" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="e.g. trainer.sg3" />
                </Form.Item>
                <Form.Item name="geography" label="Geography" rules={[{ required: true }]}>
                  <Select
                    placeholder="Choose geography"
                    options={GEOGRAPHIES.map(item => ({ value: item, label: item }))}
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={addTrainer.isPending}>
                  Create trainer
                </Button>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card title="Trainer directory" style={{ height: '100%' }}>
              {trainers.map(trainer => (
                <Flex key={trainer.id} justify="space-between" align="center" gap={12} className="business-directory-row">
                  <Flex align="center" gap={12}>
                    <CandidateAvatar name={trainer.name} size={36} />
                    <div>
                      <Typography.Text strong>{trainer.name}</Typography.Text>
                      <div className="muted small">
                        {trainer.loginId} · {trainer.geography}
                      </div>
                    </div>
                  </Flex>
                  {trainer.active ? <Tag color="success">Active</Tag> : <Tag>Inactive</Tag>}
                </Flex>
              ))}
            </Card>
          </Col>
        </Row>

        <Card title="Create calendar availability / interview slot">
          <Form
            form={slotForm}
            layout="vertical"
            requiredMark={false}
            initialValues={{ capacity: DEFAULT_SLOT_CAPACITY, instructions: '' }}
            onFinish={({ date, time, ...values }) =>
              publishSlot.mutate(
                { ...values, date: toIsoDate(date), time: time.format(TIME_FORMAT) },
                { onSuccess: () => slotForm.resetFields() },
              )
            }
          >
            <Row gutter={16}>
              <Col xs={24} md={12} xl={9}>
                <Form.Item name="trainerId" label="Trainer" rules={[{ required: true, message: 'Choose a trainer' }]}>
                  <Select
                    placeholder="Choose trainer"
                    options={trainers
                      .filter(trainer => trainer.active)
                      .map(trainer => ({ value: trainer.id, label: `${trainer.name} · ${trainer.geography}` }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} xl={5}>
                <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Choose a date' }]}>
                  <DatePicker
                    format={DATE_FORMAT}
                    style={{ width: '100%' }}
                    disabledDate={current => current.isBefore(dayjs(), 'day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={12} xl={5}>
                <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Choose a time' }]}>
                  <TimePicker
                    format={TIME_FORMAT}
                    minuteStep={SLOT_MINUTE_STEP}
                    needConfirm={false}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={12} xl={5}>
                <Form.Item name="capacity" label="Capacity" rules={[{ required: true }]}>
                  <InputNumber min={1} precision={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} xl={9}>
                <Form.Item
                  name="centre"
                  label="Centre / remote session"
                  rules={[{ required: true, whitespace: true, message: 'Enter the centre or session type' }]}
                >
                  <Input placeholder="e.g. UC Singapore Training Centre" />
                </Form.Item>
              </Col>
              <Col xs={24} xl={15}>
                <Form.Item
                  name="address"
                  label="Full address / remote instructions"
                  rules={[{ required: true, whitespace: true, message: 'Enter the address or joining instructions' }]}
                >
                  <Input placeholder="Street address, or how partners join the video call" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="instructions" label="Attendance instructions">
                  <Input.TextArea rows={3} placeholder="What partners should bring and when to arrive" />
                </Form.Item>
              </Col>
            </Row>
            <Notice>
              Trainer geography determines the route and local time zone. Published sessions appear to partners during
              registration.
            </Notice>
            <Button type="primary" htmlType="submit" loading={publishSlot.isPending}>
              Publish available session
            </Button>
          </Form>
        </Card>

        <Card title="Published calendars and sessions" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={slots}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No sessions published yet.' }}
          />
        </Card>
      </Flex>
    </>
  );
};
