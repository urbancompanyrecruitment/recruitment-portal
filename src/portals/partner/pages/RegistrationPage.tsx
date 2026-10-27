import { EnvironmentOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Checkbox, Col, Form, Input, InputNumber, Radio, Row, Select, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { registerCandidate } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { listBookableSlotsFor } from '@/api/slots';
import {
  COOKING_FREQUENCIES,
  COUNTRIES,
  GEOGRAPHIES,
  MAX_PARTNER_AGE,
  MIN_PARTNER_AGE,
  PHONE_PATTERN,
  RECRUITMENT_SOURCES,
  SOURCES_REQUIRING_REFERRER,
  YES_NO,
} from '@/domain/constant';
import { Notice, PageHeader } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import {
  CONSENT_PENDING_NOTE,
  CONSENT_TEXT,
  PARTNER_ROUTE,
  REGISTRATION_SUCCESS_MESSAGE,
  SLOT_DAY_FORMAT,
  SLOT_NOTICE,
} from '../constant';
import { RegistrationFormValues } from '../interface';

export const RegistrationPage = () => {
  const [form] = Form.useForm<RegistrationFormValues>();
  const navigate = useNavigate();
  const geography = Form.useWatch('interviewGeography', form);
  const slotId = Form.useWatch('slotId', form);
  const source = Form.useWatch('source', form);
  const slots = useQuery({
    queryKey: QUERY_KEY.bookableSlots(geography ?? ''),
    queryFn: () => listBookableSlotsFor(geography),
    enabled: Boolean(geography),
  });
  const register = useAppMutation(registerCandidate, REGISTRATION_SUCCESS_MESSAGE);
  const selectedSlot = slots.data?.find(slot => slot.id === slotId);
  const referrerRequired = SOURCES_REQUIRING_REFERRER.includes(source);

  return (
    <>
      <PageHeader
        title="Register as an Urban Company partner"
        subtitle="Complete your details and choose your preferred interview location and slot."
      />
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        onValuesChange={changed => {
          if ('interviewGeography' in changed) form.setFieldValue('slotId', undefined);
        }}
        onFinish={values =>
          register.mutate(values, { onSuccess: candidate => navigate(PARTNER_ROUTE.confirmation(candidate.id)) })
        }
      >
        <Row gutter={[23, 23]}>
          <Col xs={24} lg={13}>
            <Card title="Your details">
              <Row gutter={18}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Full name" rules={[{ required: true, whitespace: true }]}>
                    <Input autoComplete="name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="WhatsApp number with country code"
                    extra="Your L1 English interview link is sent here."
                    rules={[
                      { required: true },
                      { pattern: PHONE_PATTERN, message: 'Use + and country code, e.g. +65 9123 4567' },
                    ]}
                  >
                    <Input type="tel" placeholder="+65 9123 4567" autoComplete="tel" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="country" label="Current country" rules={[{ required: true }]}>
                    <Select placeholder="Select" options={COUNTRIES.map(value => ({ value, label: value }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="city" label="Current city" rules={[{ required: true, whitespace: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}>
                    <Select placeholder="Select" options={COUNTRIES.map(value => ({ value, label: value }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="age"
                    label="Age"
                    rules={[
                      { required: true },
                      {
                        type: 'number',
                        min: MIN_PARTNER_AGE,
                        max: MAX_PARTNER_AGE,
                        message: `Enter an age between ${MIN_PARTNER_AGE} and ${MAX_PARTNER_AGE}`,
                      },
                    ]}
                  >
                    <InputNumber style={{ width: '100%' }} precision={0} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="source" label="Where did you hear about us?" rules={[{ required: true }]}>
                    <Select placeholder="Select" options={RECRUITMENT_SOURCES.map(value => ({ value, label: value }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="referrer"
                    label="Recruiter / referrer name"
                    dependencies={['source']}
                    rules={[
                      { required: referrerRequired, whitespace: true, message: 'Add the recruiter, referrer or aggregator name' },
                    ]}
                  >
                    <Input placeholder={referrerRequired ? 'Required for this source' : 'Optional'} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="comfortableWithDogs" label="Comfortable around dogs?" rules={[{ required: true }]}>
                    <Radio.Group optionType="button" options={YES_NO} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="deepCleaningExperience" label="Deep-cleaning experience?" rules={[{ required: true }]}>
                    <Radio.Group optionType="button" options={YES_NO} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="cookingFrequency"
                    label="How often did you cook in previous work?"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select" options={COOKING_FREQUENCIES.map(value => ({ value, label: value }))} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="consent"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, checked) =>
                      checked ? Promise.resolve() : Promise.reject(new Error('Consent is required to register')),
                  },
                ]}
              >
                <Checkbox>
                  {CONSENT_TEXT} <span className="muted small">{CONSENT_PENDING_NOTE}</span>
                </Checkbox>
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" loading={register.isPending}>
                Complete registration →
              </Button>
            </Card>
          </Col>
          <Col xs={24} lg={11}>
            <Card title="Your interview">
              <Form.Item
                name="interviewGeography"
                label="Country / route you want to interview in"
                extra="This can be different from where you live now."
                rules={[{ required: true }]}
              >
                <Select placeholder="Select" options={GEOGRAPHIES.map(value => ({ value, label: value }))} />
              </Form.Item>
              {!geography && (
                <Typography.Paragraph type="secondary">
                  Choose an interview location to see the next available dates and centre details.
                </Typography.Paragraph>
              )}
              {slots.isFetching && <Spin />}
              {slots.data?.length === 0 && (
                <Alert
                  type="info"
                  showIcon
                  title="No slots are available right now. You can still register — new dates will be shared on WhatsApp."
                  style={{ marginBottom: 20 }}
                />
              )}
              {Boolean(slots.data?.length) && (
                <Form.Item
                  name="slotId"
                  label="Preferred interview slot"
                  rules={[{ required: true, message: 'Choose an interview slot' }]}
                >
                  <Radio.Group className="slot-options">
                    {slots.data?.map(slot => (
                      <Radio key={slot.id} value={slot.id} className="slot-option">
                        <strong>{dayjs(slot.date).format(SLOT_DAY_FORMAT)}</strong>
                        <span className="muted">
                          {' '}
                          · {slot.time} ({slot.timeZone})
                        </span>
                        <div className="small muted">
                          {slot.centre} · {slot.seatsLeft} {slot.seatsLeft === 1 ? 'seat' : 'seats'} left
                        </div>
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              )}
              {selectedSlot && (
                <div className="centre-box">
                  <span className="eyebrow">Interview centre</span>
                  <Typography.Title level={4} style={{ margin: '6px 0' }}>
                    {selectedSlot.centre}
                  </Typography.Title>
                  <Typography.Paragraph style={{ marginBottom: 8 }}>
                    <EnvironmentOutlined /> {selectedSlot.address}
                  </Typography.Paragraph>
                  <Typography.Paragraph type="secondary" className="small" style={{ marginBottom: 0 }}>
                    {selectedSlot.instructions}
                  </Typography.Paragraph>
                </div>
              )}
              <Notice style={{ marginTop: 22 }}>{SLOT_NOTICE}</Notice>
              <Typography.Paragraph type="secondary" className="small" style={{ marginBottom: 0 }}>
                You can complete L1 at home or at the training centre. Overseas arrangements follow the
                location-specific instructions.
              </Typography.Paragraph>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
};
