export const CANDIDATE_AVATAR_STYLE = { background: '#ece4f9', color: '#7039bc', fontWeight: 700, flexShrink: 0 };

export const GOOGLE_GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export const GOOGLE_GSI_SCRIPT_ID = 'google-gsi-client';

export const GOOGLE_BUTTON_OPTIONS: google.accounts.id.GsiButtonConfiguration = {
  type: 'standard',
  theme: 'outline',
  size: 'large',
  text: 'signin_with',
  shape: 'rectangular',
  width: 320,
};

export const GOOGLE_SIGN_IN_UNAVAILABLE = 'Google sign-in could not be loaded. Check your connection and reload the page.';
