import { EnvironmentOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Result,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCandidate } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { RegistrationResult } from '@/api/interface';
import { listBookableSlotsFor } from '@/api/slots';
import {
  COOKING_FREQUENCIES,
  COUNTRIES,
  DAY_DATE_FORMAT,
  MAX_PARTNER_AGE,
  MIN_PARTNER_AGE,
  PASSWORD_MIN_LENGTH,
  PHONE_PATTERN,
  RECRUITMENT_SOURCES,
  SINGAPORE_INTERVIEW_CITIES,
  SINGAPORE_PHONE_PATTERN,
  SOURCES_REQUIRING_REFERRER,
  YES_NO,
} from '@/domain/constant';
import { isSingaporePhone } from '@/domain/phone';
import { getInterviewCity } from '@/domain/slot';
import { Notice, PageHeader } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import {
  CONFIRM_PASSWORD_ERROR,
  CONSENT_PENDING_NOTE,
  CONSENT_TEXT,
  COPY_PRIMARY_LABEL,
  PARTNER_ROUTE,
  PASSWORD_ERROR,
  PASSWORD_HINT,
  PRIMARY_PHONE_ERROR,
  PRIMARY_PHONE_HINT,
  REGISTRATION_SUCCESS_MESSAGE,
  SINGAPORE_PHONE_ERROR,
  SINGAPORE_PHONE_HINT,
  SLOT_DAY_FORMAT,
  SLOT_NOTICE,
  THANK_YOU,
} from '../constant';
import { RegistrationFormValues } from '../interface';

export const RegistrationPage = () => {
  const [form] = Form.useForm<RegistrationFormValues>();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<RegistrationResult>();
  const [copyPrimary, setCopyPrimary] = useState(false);
  const interviewCity = Form.useWatch('interviewCity', form);
  const slotId = Form.useWatch('slotId', form);
  const source = Form.useWatch('source', form);
  const primaryPhone = Form.useWatch('primaryPhone', form) ?? '';
  const slots = useQuery({
    queryKey: QUERY_KEY.bookableSlots(interviewCity ?? ''),
    queryFn: () => listBookableSlotsFor(interviewCity),
    enabled: Boolean(interviewCity),
  });
  const register = useAppMutation(registerCandidate, REGISTRATION_SUCCESS_MESSAGE);
  const selectedSlot = slots.data?.find(slot => slot.id === slotId);
  const selectedCity = getInterviewCity(interviewCity ?? '');
  const referrerRequired = SOURCES_REQUIRING_REFERRER.includes(source);
  const primaryIsSingapore = isSingaporePhone(primaryPhone);
  const slotDays = [...new Set(slots.data?.map(slot => slot.date) ?? [])];

  if (registration) {
    const { candidate, slot } = registration;
    const city = getInterviewCity(candidate.interviewCity);

    return (
      <Card>
        <Result
          status="success"
          title={THANK_YOU.title}
          subTitle={THANK_YOU.subtitle}
          extra={
            <Flex gap={10} justify="center" wrap>
              <Button type="primary" onClick={() => navigate(PARTNER_ROUTE.login)}>
                {THANK_YOU.checkStatus}
              </Button>
              <Button
                onClick={() => {
                  setRegistration(undefined);
                  setCopyPrimary(false);
                  form.resetFields();
                }}
              >
                {THANK_YOU.registerAnother}
              </Button>
            </Flex>
          }
        >
          <Descriptions
            column={1}
            size="small"
            items={[
              { key: 'name', label: 'Name', children: candidate.name },
              { key: 'primary', label: 'Primary mobile', children: candidate.primaryPhone },
              ...(candidate.singaporePhone
                ? [{ key: 'singapore', label: 'Singapore mobile', children: candidate.singaporePhone }]
                : []),
              ...(slot && city
                ? [
                    { key: 'centre', label: 'Interview centre', children: `${city.centre}, ${city.name}` },
                    { key: 'when', label: 'Day & time', children: `${dayjs(slot.date).format(DAY_DATE_FORMAT)} · ${slot.time} (${slot.timeZone})` },
                    { key: 'address', label: 'Address', children: city.address },
                    { key: 'instructions', label: 'Instructions', children: city.instructions },
                  ]
                : [{ key: 'no-slot', label: 'Interview', children: THANK_YOU.noSlot }]),
            ]}
          />
          {candidate.onboarding && (
            <Notice tone="success" style={{ marginTop: 20, marginBottom: 0 }}>
              {THANK_YOU.onboardingNote}
            </Notice>
          )}
        </Result>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Register as an Urban Company partner"
        subtitle="Complete your details and choose your interview city and slot."
      />
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        onValuesChange={changed => {
          if ('interviewCity' in changed) form.setFieldValue('slotId', undefined);

          if ('primaryPhone' in changed && copyPrimary) form.setFieldValue('singaporePhone', changed.primaryPhone);
        }}
        onFinish={({ confirmPassword, ...values }) => register.mutate(values, { onSuccess: setRegistration })}
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
                    name="primaryPhone"
                    label="Primary mobile number"
                    extra={PRIMARY_PHONE_HINT}
                    rules={[{ required: true }, { pattern: PHONE_PATTERN, message: PRIMARY_PHONE_ERROR }]}
                  >
                    <Input type="tel" placeholder="+95 9123 4567" autoComplete="tel" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="singaporePhone"
                    label="Singapore mobile number (optional)"
                    extra={SINGAPORE_PHONE_HINT}
                    rules={[{ pattern: SINGAPORE_PHONE_PATTERN, message: SINGAPORE_PHONE_ERROR }]}
                  >
                    <Input type="tel" placeholder="+65 9123 4567" disabled={copyPrimary} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  {primaryIsSingapore && (
                    <Form.Item label=" " colon={false}>
                      <Checkbox
                        checked={copyPrimary}
                        onChange={event => {
                          setCopyPrimary(event.target.checked);
                          form.setFieldValue('singaporePhone', event.target.checked ? primaryPhone : '');
                        }}
                      >
                        {COPY_PRIMARY_LABEL}
                      </Checkbox>
                    </Form.Item>
                  )}
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    extra={PASSWORD_HINT}
                    rules={[{ required: true, message: PASSWORD_ERROR }, { min: PASSWORD_MIN_LENGTH, message: PASSWORD_ERROR }]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm password"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: CONFIRM_PASSWORD_ERROR },
                      ({ getFieldValue }) => ({
                        validator: (_, value) =>
                          value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error(CONFIRM_PASSWORD_ERROR)),
                      }),
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
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
                name="interviewCity"
                label="Interview city"
                extra="Interviews are held in Singapore. Pick the centre closest to you."
                rules={[{ required: true, message: 'Choose an interview city' }]}
              >
                <Select
                  placeholder="Select"
                  options={SINGAPORE_INTERVIEW_CITIES.map(city => ({ value: city.key, label: city.name }))}
                />
              </Form.Item>
              {!interviewCity && (
                <Typography.Paragraph type="secondary">
                  Choose a city to see the next available slots and centre details.
                </Typography.Paragraph>
              )}
              {slots.isFetching && <Spin />}
              {slots.data?.length === 0 && (
                <Alert
                  type="info"
                  showIcon
                  title="No slots are available in the next days. You can still register — the team will share new dates."
                  style={{ marginBottom: 20 }}
                />
              )}
              {Boolean(slots.data?.length) && (
                <Form.Item
                  name="slotId"
                  label="Interview slot"
                  rules={[{ required: true, message: 'Choose an interview slot' }]}
                >
                  <Radio.Group className="slot-options">
                    {slotDays.map(date => (
                      <div key={date} className="slot-day">
                        <div className="small muted slot-day-label">{dayjs(date).format(SLOT_DAY_FORMAT)}</div>
                        <Flex gap={6} wrap>
                          {slots.data
                            ?.filter(slot => slot.date === date)
                            .map(slot => (
                              <Radio.Button key={slot.id} value={slot.id}>
                                {slot.time}
                              </Radio.Button>
                            ))}
                        </Flex>
                      </div>
                    ))}
                  </Radio.Group>
                </Form.Item>
              )}
              {selectedSlot && selectedCity && (
                <div className="centre-box">
                  <span className="eyebrow">Interview centre</span>
                  <Typography.Title level={4} style={{ margin: '6px 0' }}>
                    {selectedCity.centre}
                  </Typography.Title>
                  <Typography.Paragraph style={{ marginBottom: 4 }}>
                    <EnvironmentOutlined /> {selectedCity.address}
                  </Typography.Paragraph>
                  <Typography.Paragraph style={{ marginBottom: 8 }}>
                    {dayjs(selectedSlot.date).format(DAY_DATE_FORMAT)} · {selectedSlot.time} ({selectedSlot.timeZone}) ·{' '}
                    {selectedSlot.seatsLeft} {selectedSlot.seatsLeft === 1 ? 'seat' : 'seats'} left
                  </Typography.Paragraph>
                  <Typography.Paragraph type="secondary" className="small" style={{ marginBottom: 0 }}>
                    {selectedCity.instructions}
                  </Typography.Paragraph>
                </div>
              )}
              <Notice style={{ marginTop: 22, marginBottom: 0 }}>{SLOT_NOTICE}</Notice>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
};
