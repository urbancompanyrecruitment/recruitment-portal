import { Alert } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { environment } from '@/config';
import { GOOGLE_BUTTON_OPTIONS, GOOGLE_GSI_SCRIPT_ID, GOOGLE_GSI_SCRIPT_URL, GOOGLE_SIGN_IN_UNAVAILABLE } from './constant';
import { GoogleSignInProps } from './interface';

export const GoogleSignIn = ({ onCredential }: GoogleSignInProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: response => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, GOOGLE_BUTTON_OPTIONS);
    };

    const existing = document.getElementById(GOOGLE_GSI_SCRIPT_ID) as HTMLScriptElement | null;
    const script =
      existing ??
      document.head.appendChild(
        Object.assign(document.createElement('script'), {
          id: GOOGLE_GSI_SCRIPT_ID,
          src: GOOGLE_GSI_SCRIPT_URL,
          async: true,
          defer: true,
        }),
      );

    if (window.google) renderButton();

    script.addEventListener('load', renderButton);
    script.addEventListener('error', () => setUnavailable(true));

    return () => script.removeEventListener('load', renderButton);
  }, []);

  return (
    <>
      <div ref={buttonRef} />
      {unavailable && <Alert type="warning" showIcon title={GOOGLE_SIGN_IN_UNAVAILABLE} />}
    </>
  );
};
