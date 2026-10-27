import { StepsProps } from 'antd';
import { InvitationStatus, StageResult } from '@/domain/interface';

export const PARTNER_ROUTE = {
  registration: '/partner',
  confirmation: (candidateId: string) => `/partner/registration/${candidateId}`,
};

export const REGISTRATION_SUCCESS_MESSAGE = 'Registration saved. L1 invitation queued (demo — no WhatsApp message is sent).';

export const L1_COMPLETED_MESSAGE = 'L1 marked completed. A trainer will review and record the result.';

export const CONSENT_TEXT =
  'I consent to Urban Company collecting my details and registering me as an Urban Company partner.';

export const CONSENT_PENDING_NOTE = 'Final consent wording requires legal approval.';

export const SLOT_DAY_FORMAT = 'ddd, D MMM';

export const SLOT_NOTICE = 'Slots are shown before L1 is completed. Pass the online L1 English test before proceeding to L2.';

export const INVITATION_LABEL: Record<InvitationStatus, string> = {
  [InvitationStatus.Queued]: 'Queued — Hireflix will send it shortly',
  [InvitationStatus.Sent]: 'Sent to your WhatsApp',
  [InvitationStatus.Completed]: 'Completed',
};

export const STEP_STATUS: Record<StageResult, StepsProps['status']> = {
  [StageResult.Passed]: 'finish',
  [StageResult.Failed]: 'error',
  [StageResult.Pending]: 'wait',
};

export const L2_ELIGIBILITY: Record<StageResult, string> = {
  [StageResult.Passed]: 'Eligible for L2',
  [StageResult.Failed]: 'Not eligible — L1 not passed',
  [StageResult.Pending]: 'Awaiting L1 result',
};
