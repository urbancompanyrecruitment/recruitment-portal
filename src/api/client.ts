import { MOCK_LATENCY_MS } from '@/mocks/constant';
import { readDb, writeDb } from '@/mocks/db';
import { MockChange, MockDb } from '@/mocks/interface';

const simulateLatency = () => new Promise(resolve => setTimeout(resolve, MOCK_LATENCY_MS));

export const mockQuery = async <T>(select: (db: MockDb) => T): Promise<T> => {
  await simulateLatency();
  return structuredClone(select(readDb()));
};

export const mockMutation = async <T>(change: (db: MockDb) => MockChange<T>): Promise<T> => {
  await simulateLatency();
  const { db, result } = change(readDb());
  writeDb(db);
  return structuredClone(result);
};

export const findOrThrow = <T>(items: T[], predicate: (item: T) => boolean, message: string): T => {
  const found = items.find(predicate);
  if (!found) throw new Error(message);
  return found;
};
