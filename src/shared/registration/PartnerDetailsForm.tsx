import { Button, Card, Checkbox, Col, Form, Input, InputNumber, Radio, Row, Select, Typography } from 'antd';
import { useState } from 'react';
import {
  COOKING_FREQUENCY_OPTIONS,
  MAX_PARTNER_AGE,
  MIN_PARTNER_AGE,
  NATIONALITY_OPTIONS,
  PARTNER_COUNTRY_OPTIONS,
  PHONE_PATTERN,
  RECRUITMENT_SOURCE_OPTIONS,
  SINGAPORE_PHONE_PATTERN,
  SOURCES_REQUIRING_REFERRER,
  TERMS,
  YES_NO_OPTIONS,
} from '@/domain/constant';
import { isSingaporePhone } from '@/domain/phone';
import { Notice } from '@/shared/components/ui';
import {
  CONSENT_ERROR,
  COOKING_WRAPPER_COL,
  NAME_PART_MAX_LENGTH,
  PRIMARY_PHONE_ERROR,
  REFERRER_ERROR,
  REGISTRATION_COPY,
  SINGAPORE_PHONE_ERROR,
} from './constant';
import { PartnerDetailsFormProps, PartnerDetailsFormValues, RegistrationMode } from './interface';
import { SlotPicker } from './SlotPicker';

export const PartnerDetailsForm = ({ mode, submitting, onSubmit }: PartnerDetailsFormProps) => {
  const [form] = Form.useForm<PartnerDetailsFormValues>();
  const [copyPrimary, setCopyPrimary] = useState(false);
  const country = Form.useWatch('country', form);
  const source = Form.useWatch('source', form);
  const primaryPhone = Form.useWatch('primaryPhone', form) ?? '';
  const copy = REGISTRATION_COPY[mode];
  const referrerRequired = source !== undefined && SOURCES_REQUIRING_REFERRER.includes(source);
  const primaryIsSingapore = isSingaporePhone(primaryPhone);

  return (
    <Form
      form={form}
      layout="vertical"
      scrollToFirstError
      onValuesChange={changed => {
        if ('country' in changed) form.setFieldsValue({ interviewCity: undefined, slotId: undefined });

        if ('primaryPhone' in changed && copyPrimary) form.setFieldValue('singaporePhone', changed.primaryPhone);
      }}
      onFinish={values => onSubmit({ ...values, consent: true })}
    >
      <Row gutter={[23, 23]}>
        <Col xs={24} lg={13}>
          <Card title={copy.detailsTitle}>
            <Row gutter={18}>
              <Col xs={24} md={12}>
                <Form.Item name="firstName" label="First name" rules={[{ required: true, whitespace: true, max: NAME_PART_MAX_LENGTH }]}>
                  <Input autoComplete="given-name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label="Last name"
                  extra={copy.lastNameHint}
                  rules={[{ required: true, whitespace: true, max: NAME_PART_MAX_LENGTH }]}
                >
                  <Input autoComplete="family-name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="primaryPhone"
                  label="Primary mobile number"
                  extra={copy.primaryPhoneHint}
                  rules={[{ required: true }, { pattern: PHONE_PATTERN, message: PRIMARY_PHONE_ERROR }]}
                >
                  <Input type="tel" placeholder="+95 9123 4567" autoComplete="tel" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="singaporePhone"
                  label="Singapore mobile number"
                  extra={copy.singaporePhoneHint}
                  rules={[{ pattern: SINGAPORE_PHONE_PATTERN, message: SINGAPORE_PHONE_ERROR }]}
                >
                  <Input type="tel" placeholder="+65 9123 4567" disabled={copyPrimary} />
                </Form.Item>
              </Col>
              {primaryIsSingapore && (
                <Col xs={24}>
                  <Form.Item>
                    <Checkbox
                      checked={copyPrimary}
                      onChange={event => {
                        setCopyPrimary(event.target.checked);
                        form.setFieldValue('singaporePhone', event.target.checked ? primaryPhone : '');
                      }}
                    >
                      {copy.copyPrimaryLabel}
                    </Checkbox>
                  </Form.Item>
                </Col>
              )}
              <Col xs={24} md={12}>
                <Form.Item name="country" label="Current country" rules={[{ required: true }]}>
                  <Select placeholder="Select" options={PARTNER_COUNTRY_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="city" label="Current city" rules={[{ required: true, whitespace: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}>
                  <Select showSearch placeholder="Select" options={NATIONALITY_OPTIONS} optionFilterProp="label" />
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
              {mode === RegistrationMode.Partner && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item name="source" label="Where did you hear about us?" rules={[{ required: true }]}>
                      <Select placeholder="Select" options={RECRUITMENT_SOURCE_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="referrer"
                      label="Recruiter / referrer name"
                      dependencies={['source']}
                      rules={[{ required: referrerRequired, whitespace: true, message: REFERRER_ERROR }]}
                    >
                      <Input placeholder={referrerRequired ? 'Required for this source' : 'Optional'} />
                    </Form.Item>
                  </Col>
                </>
              )}
              <Col xs={24} md={12}>
                <Form.Item name="comfortableWithDogs" label="Comfortable around dogs?" rules={[{ required: true }]}>
                  <Radio.Group optionType="button" options={YES_NO_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="deepCleaningExperience" label="Deep-cleaning experience?" rules={[{ required: true }]}>
                  <Radio.Group optionType="button" options={YES_NO_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="cookingFrequency" label={copy.cookingLabel} wrapperCol={COOKING_WRAPPER_COL} rules={[{ required: true }]}>
                  <Select placeholder="Select" options={COOKING_FREQUENCY_OPTIONS} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="consent"
              valuePropName="checked"
              rules={[{ validator: (_, checked) => (checked ? Promise.resolve() : Promise.reject(new Error(CONSENT_ERROR))) }]}
            >
              <Checkbox>{copy.consent}</Checkbox>
            </Form.Item>
            <Typography.Paragraph type="secondary" className="small">
              {copy.termsNote}{' '}
              <a href={TERMS.partnerPdf} target="_blank" rel="noreferrer">
                {TERMS.label}
              </a>
              .
            </Typography.Paragraph>
            <Button type="primary" htmlType="submit" size="large" loading={submitting}>
              {copy.submit}
            </Button>
          </Card>
        </Col>
        <Col xs={24} lg={11}>
          <Card title={copy.interviewTitle}>
            <SlotPicker country={country} />
            <Notice style={{ marginTop: 22, marginBottom: 0 }}>{copy.slotNotice}</Notice>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};
