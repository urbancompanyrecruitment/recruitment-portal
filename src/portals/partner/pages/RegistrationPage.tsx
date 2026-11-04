import { EnvironmentOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
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
import { registerCandidate } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { RegistrationResult } from '@/api/interface';
import { listBookableSlotsFor } from '@/api/slots';
import {
  COOKING_FREQUENCIES,
  COUNTRIES,
  DAY_DATE_FORMAT,
  GEOGRAPHIES,
  MAX_PARTNER_AGE,
  MIN_PARTNER_AGE,
  PHONE_PATTERN,
  RECRUITMENT_SOURCES,
  SINGAPORE_PHONE_PATTERN,
  SOURCES_REQUIRING_REFERRER,
  YES_NO,
} from '@/domain/constant';
import { isSingaporePhone } from '@/domain/phone';
import { Notice, PageHeader } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import {
  CONSENT_PENDING_NOTE,
  CONSENT_TEXT,
  COPY_PRIMARY_LABEL,
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
  const [registration, setRegistration] = useState<RegistrationResult>();
  const [copyPrimary, setCopyPrimary] = useState(false);
  const geography = Form.useWatch('interviewGeography', form);
  const slotId = Form.useWatch('slotId', form);
  const source = Form.useWatch('source', form);
  const primaryPhone = Form.useWatch('primaryPhone', form) ?? '';
  const slots = useQuery({
    queryKey: QUERY_KEY.bookableSlots(geography ?? ''),
    queryFn: () => listBookableSlotsFor(geography),
    enabled: Boolean(geography),
  });
  const register = useAppMutation(registerCandidate, REGISTRATION_SUCCESS_MESSAGE);
  const selectedSlot = slots.data?.find(slot => slot.id === slotId);
  const referrerRequired = SOURCES_REQUIRING_REFERRER.includes(source);
  const primaryIsSingapore = isSingaporePhone(primaryPhone);

  if (registration) {
    const { candidate, slot } = registration;

    return (
      <Card>
        <Result
          status="success"
          title={THANK_YOU.title}
          subTitle={THANK_YOU.subtitle}
          extra={
            <Button
              onClick={() => {
                setRegistration(undefined);
                setCopyPrimary(false);
                form.resetFields();
              }}
            >
              {THANK_YOU.registerAnother}
            </Button>
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
              ...(slot
                ? [
                    { key: 'centre', label: 'Interview centre', children: slot.centre },
                    { key: 'when', label: 'Day & time', children: `${dayjs(slot.date).format(DAY_DATE_FORMAT)} · ${slot.time} (${slot.timeZone})` },
                    { key: 'address', label: 'Address', children: slot.address },
                    { key: 'instructions', label: 'Instructions', children: slot.instructions },
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
        subtitle="Complete your details and choose your preferred interview location and slot."
      />
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        onValuesChange={changed => {
          if ('interviewGeography' in changed) form.setFieldValue('slotId', undefined);

          if ('primaryPhone' in changed && copyPrimary) form.setFieldValue('singaporePhone', changed.primaryPhone);
        }}
        onFinish={values => register.mutate(values, { onSuccess: setRegistration })}
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
                  title="No slots are available right now. You can still register — the team will share new dates."
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
              <Notice style={{ marginTop: 22, marginBottom: 0 }}>{SLOT_NOTICE}</Notice>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
};
