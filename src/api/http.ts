import { readCookie } from '@/shared/utils/cookie';
import { API_ERROR, HTTP_UNAUTHORIZED, TOKEN_COOKIE } from './constant';
import { ApiEnvelope, RequestOptions } from './interface';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const request = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const token = readCookie(TOKEN_COOKIE);
  const headers: Record<string, string> = token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const envelope = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (response.ok && !envelope.isError) return envelope.success?.data ?? (envelope as T);

  const fallback = response.status === HTTP_UNAUTHORIZED ? API_ERROR.sessionExpired : API_ERROR.requestFailed;

  throw new HttpError(response.status, envelope.error?.message ?? envelope.message ?? fallback);
};
