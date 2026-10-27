export const toPercent = (part: number, total: number): number => (total ? Math.round((part / total) * 100) : 0);
