import dayjs from 'dayjs';
import { DATE_FORMAT, DATE_TIME_FORMAT, ISO_DATE_FORMAT } from './constant';

export const formatDate = (date: string | undefined, fallback = 'Not confirmed'): string =>
  date ? dayjs(date).format(DATE_FORMAT) : fallback;

export const formatDateTime = (value: string | number): string => dayjs(value).format(DATE_TIME_FORMAT);

export const toIsoDate = (value: dayjs.ConfigType = undefined): string => dayjs(value).format(ISO_DATE_FORMAT);

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
