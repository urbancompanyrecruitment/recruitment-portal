import { Sessions } from '@/shared/auth/interface';

export interface RenderOptions {
  route?: string;
  sessions?: Sessions;
}

export interface ApiStub {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  status?: number;
  body?: unknown;
  text?: string;
}
