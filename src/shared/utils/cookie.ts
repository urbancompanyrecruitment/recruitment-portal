export const readCookie = (name: string): string | undefined =>
  document.cookie
    .split('; ')
    .map(entry => entry.split('='))
    .filter(([key]) => key === name)
    .map(([, value]) => decodeURIComponent(value))[0];

export const writeCookie = (name: string, value: string, maxAgeSeconds: number): void => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; path=/; max-age=0`;
};
