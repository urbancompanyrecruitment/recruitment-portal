const CSV_LINE_BREAK = /\r?\n/;

const CSV_QUOTES = /^"|"$/g;

const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

const BYTE_ORDER_MARK = '\uFEFF';

export const downloadTextFile = (content: string, fileName: string, type = CSV_MIME_TYPE): void => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const downloadCsv = (rows: unknown[][], fileName: string): void =>
  downloadTextFile(
    BYTE_ORDER_MARK + rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n'),
    fileName,
  );

export const parseCsvRecords = <Column extends string>(text: string, columns: Column[]): Record<Column, string>[] => {
  const rows = text
    .replace(BYTE_ORDER_MARK, '')
    .split(CSV_LINE_BREAK)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(',').map(cell => cell.trim().replace(CSV_QUOTES, '').trim()));
  const header = rows[0]?.map(cell => cell.toLowerCase()) ?? [];
  const hasHeader = header.includes(columns[0]);
  const indexes = columns.map((column, position) => (hasHeader ? header.indexOf(column) : position));

  return rows
    .slice(hasHeader ? 1 : 0)
    .map(row => Object.fromEntries(columns.map((column, position) => [column, row[indexes[position]] ?? ''])) as Record<Column, string>);
};
