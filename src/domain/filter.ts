import { YesNoFilter } from './interface';

export const matchesYesNo = (filter: YesNoFilter | undefined, value: boolean): boolean => !filter || (filter === YesNoFilter.Yes) === value;
