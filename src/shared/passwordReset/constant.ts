export const RESET_TOKEN_PARAM = 'token';

export const FORGOT_PASSWORD = {
  link: 'Forgot password?',
  title: 'Forgot your password?',
  subtitle: 'Enter the email you sign in with. We will email you a link to choose a new password.',
  emailError: 'Enter your email',
  submit: 'Email me a reset link',
  sentTitle: 'Check your email',
  sentSubtitle: (email: string) =>
    `If an account exists for ${email}, we sent it a link to choose a new password. The link works once and expires in 30 minutes. Check the spam folder if it does not arrive.`,
  backToSignIn: '← Back to sign in',
};

export const RESET_PASSWORD = {
  title: 'Choose a new password',
  subtitle: 'Enter your new password twice. Use at least 8 characters. The link from the email works once and only for 30 minutes; your old password and every signed-in device stop working.',
  newLabel: 'New password',
  confirmLabel: 'Confirm new password',
  mismatch: 'Passwords do not match',
  submit: 'Save new password',
  missingToken: 'This page needs the link from the reset email. Request a new link if you no longer have it.',
  requestNewLink: 'Request a new link',
  doneTitle: 'Your password has been changed',
  doneSubtitle: 'Sign in with your new password.',
  signIn: 'Sign in',
};
