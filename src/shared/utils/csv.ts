const CSV_LINE_BREAK = /\r?\n/;

const CSV_QUOTES = /^"|"$/g;

const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

export const downloadTextFile = (content: string, fileName: string, type = CSV_MIME_TYPE): void => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const downloadCsv = (rows: unknown[][], fileName: string): void =>
  downloadTextFile(
    '﻿' + rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n'),
    fileName,
  );

export const parseCsvColumn = (text: string, columnName: string): string[] => {
  const rows = text
    .replace('﻿', '')
    .split(CSV_LINE_BREAK)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(',').map(cell => cell.trim().replace(CSV_QUOTES, '').trim()));
  const headerIndex = rows[0]?.findIndex(cell => cell.toLowerCase() === columnName) ?? -1;
  const column = headerIndex >= 0 ? headerIndex : 0;

  return rows.slice(headerIndex >= 0 ? 1 : 0).map(row => row[column] ?? '');
};
