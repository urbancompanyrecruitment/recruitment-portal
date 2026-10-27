export const downloadCsv = (rows: unknown[][], fileName: string): void => {
  const content =
    '﻿' + rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};
