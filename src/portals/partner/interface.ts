export interface PartnerLoginFormValues {
  primaryPhone: string;
  lastName: string;
}

export interface RescheduleFormValues {
  interviewCity: string;
  slotId: string;
}

export interface RescheduleModalProps {
  open: boolean;
  country: string;
  onClose: () => void;
}

export interface NotificationBellProps {
  partnerId: string;
}

export interface NotificationCopy {
  title: string;
  body: (data?: Record<string, string>) => string;
}
