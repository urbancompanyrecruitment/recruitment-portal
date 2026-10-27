import { AssessmentStage, StageResult, StageResults } from '@/domain/interface';

export const MOCK_DB_STORAGE_KEY = 'recruitment-portal-mock-db-v1';

export const MOCK_LATENCY_MS = 120;

export const DEMO_PASSWORD = 'Demo123!';

export const BUSINESS_ACCOUNT = { id: 'business-admin', name: 'Business team', loginId: 'business.admin', subtitle: 'Admin' };

export const MAX_RESERVATION_EVENTS = 200;

export const HOUR_MS = 60 * 60 * 1000;

export const PASSED_ALL_RESULTS: StageResults = {
  [AssessmentStage.L1]: StageResult.Passed,
  [AssessmentStage.L2]: StageResult.Passed,
  [AssessmentStage.L3]: StageResult.Passed,
};

export const SINGAPORE_CENTRE = {
  centre: 'UC Singapore Training Centre',
  address: '#05-01, 10 Sample Road, Singapore 000000 (placeholder — business to confirm)',
  instructions:
    'Arrive 15 minutes early with your passport or work permit. Wear comfortable clothes for the practical cleaning assessment.',
};

export const MYANMAR_CENTRE = {
  centre: 'UC Yangon Training Centre',
  address: 'No. 12, Sample Street, Kamayut Township, Yangon (placeholder — business to confirm)',
  instructions: 'Bring your NRC or passport. The L2 cleaning interview is conducted in person at the centre.',
};

export const REMOTE_CENTRE = {
  centre: 'Remote interview',
  address: 'Video call — no physical centre',
  instructions: 'A video-call link will be sent to your WhatsApp number 24 hours before the slot. Keep your passport ready.',
};
