import { environment } from '@/config';
import { API_ERROR, API_ERROR_BY_CODE, HTTP_NO_CONTENT, HTTP_UNAUTHORIZED } from './constant';
import { ErrorBody, RequestOptions } from './interface';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

const send = (path: string, options: RequestOptions): Promise<Response> =>
  fetch(`${environment.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'same-origin',
  });

const toError = async (response: Response): Promise<HttpError> => {
  const body = (await response.json().catch(() => ({}))) as ErrorBody;
  const code = body.error?.code;
  const fallback = response.status === HTTP_UNAUTHORIZED ? API_ERROR.sessionExpired : API_ERROR.requestFailed;

  return new HttpError(response.status, code, (code && API_ERROR_BY_CODE[code]) ?? body.error?.message ?? fallback);
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await send(path, options);

  if (!response.ok) throw await toError(response);

  if (response.status === HTTP_NO_CONTENT) return undefined as T;

  return (await response.json()) as T;
};

export const requestText = async (path: string): Promise<string> => {
  const response = await send(path, {});

  if (!response.ok) throw await toError(response);

  return response.text();
};
