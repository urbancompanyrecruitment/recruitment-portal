const WHITESPACE = /\s+/g;

const compact = (value: string): string => value.replace(WHITESPACE, '');

export const matchesSearch = (search: string, values: Array<string | number | undefined | null>): boolean => {
  const needle = search.trim().toLowerCase();

  if (!needle) return true;

  const haystack = values
    .filter(value => value !== undefined && value !== null && value !== '')
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle) || compact(haystack).includes(compact(needle));
};
