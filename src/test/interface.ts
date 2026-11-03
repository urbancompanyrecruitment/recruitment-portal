import { Sessions } from '@/shared/auth/interface';

export interface RenderOptions {
  route?: string;
  sessions?: Sessions;
}

export interface FetchStub {
  status?: number;
  body: unknown;
}
