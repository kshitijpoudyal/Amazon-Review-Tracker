import { Product } from '../types/Product';

export type ParsedProductImport = Omit<Product, 'id'>;

function stripBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

function parseBool(val: string | undefined): boolean {
  return val?.trim() === 'Y';
}

function parseNum(val: string | undefined): number | null {
  if (!val || val.trim() === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  fields.push(current);
  return fields;
};

function getField(row: Record<string, string>, name: string): string | undefined {
  const key = Object.keys(row).find(k => k.trim().toLowerCase() === name.toLowerCase());
  return key ? row[key] : undefined;
}

function parseRows(content: string): Record<string, string>[] {
  const lines = content.trim().split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = fields[idx]?.trim() ?? '';
    });
    records.push(row);
  }

  return records;
}

function getItemValue(row: Record<string, string>): string {
  return getField(row, 'item')?.trim() ?? '';
}

export const validateProductCSV = (csvContent: string): { isValid: boolean; error?: string } => {
  try {
    const content = stripBom(csvContent.trim());
    if (!content) {
      return { isValid: false, error: 'CSV file is empty' };
    }

    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      return { isValid: false, error: 'CSV file must contain at least a header and one data row' };
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    if (!headers.includes('item')) {
      return { isValid: false, error: 'Missing required column: Item' };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
};

export const parseProductCSV = (csvContent: string): { products: ParsedProductImport[]; skipped: number } => {
  const content = stripBom(csvContent.trim());
  const records = parseRows(content);

  let skipped = 0;
  const products: ParsedProductImport[] = [];

  for (const row of records) {
    const item = getItemValue(row);
    if (!item) {
      skipped++;
      continue;
    }

    const paid = parseNum(getField(row, 'paid'));
    const received = parseNum(getField(row, 'received'));
    const delta = received !== null && paid !== null ? received - paid : null;

    products.push({
      item,
      orderDate: null,
      orderPlaced: parseBool(getField(row, 'orderPlaced')),
      orderDelivered: parseBool(getField(row, 'orderDelivered')),
      reviewAdded: parseBool(getField(row, 'reviewAdded')),
      reviewLive: parseBool(getField(row, 'reviewLive')),
      reviewSSSent: parseBool(getField(row, 'reviewSSSent')),
      paid,
      received,
      delta,
    });
  }

  return { products, skipped };
};
