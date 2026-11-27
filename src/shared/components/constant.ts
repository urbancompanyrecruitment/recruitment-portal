export const CANDIDATE_AVATAR_STYLE = { background: '#ece4f9', color: '#7039bc', fontWeight: 700, flexShrink: 0 };

export const CHANGE_PASSWORD = {
  button: 'Change password',
  title: 'Change your password',
  currentLabel: 'Current password',
  newLabel: 'New password',
  confirmLabel: 'Confirm new password',
  submit: 'Save new password',
  success: 'Password changed. Use the new password the next time you sign in.',
  currentRequired: 'Enter your current password',
  mismatch: 'Passwords do not match',
};

export const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const TABLE_PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
  showSizeChanger: true,
  showTotal: (total: number, [from, to]: [number, number]) => `${from}–${to} of ${total}`,
};

/** Columns shrink and wrap to fit the card; the table scrolls sideways only when wrapping is not enough. */
export const TABLE_SCROLL = { x: true } as const;

export const CARD_PAGE_SIZE = 12;
