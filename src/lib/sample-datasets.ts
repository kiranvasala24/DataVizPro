import { ExcelFile, ParsedData, ColumnInfo } from './excel-parser';

// Helper to create column info
function createColumn(
  name: string, 
  type: 'string' | 'number' | 'date' | 'boolean',
  values: any[]
): ColumnInfo {
  const numericValues = values.filter(v => typeof v === 'number');
  return {
    name,
    type,
    nullCount: values.filter(v => v === null || v === undefined || v === '').length,
    uniqueValues: new Set(values).size,
    min: type === 'number' ? Math.min(...numericValues) : undefined,
    max: type === 'number' ? Math.max(...numericValues) : undefined,
    sum: type === 'number' ? numericValues.reduce((a, b) => a + b, 0) : undefined,
    avg: type === 'number' ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : undefined,
  };
}

// Sample Sales Dataset
const salesData = {
  rows: [
    { Region: 'North', Product: 'Laptop', Revenue: 45000, Units: 150, Month: 'January' },
    { Region: 'South', Product: 'Laptop', Revenue: 38000, Units: 127, Month: 'January' },
    { Region: 'East', Product: 'Laptop', Revenue: 52000, Units: 173, Month: 'January' },
    { Region: 'West', Product: 'Laptop', Revenue: 41000, Units: 137, Month: 'January' },
    { Region: 'North', Product: 'Phone', Revenue: 32000, Units: 320, Month: 'January' },
    { Region: 'South', Product: 'Phone', Revenue: 28000, Units: 280, Month: 'January' },
    { Region: 'East', Product: 'Phone', Revenue: 35000, Units: 350, Month: 'January' },
    { Region: 'West', Product: 'Phone', Revenue: 30000, Units: 300, Month: 'January' },
    { Region: 'North', Product: 'Tablet', Revenue: 22000, Units: 110, Month: 'February' },
    { Region: 'South', Product: 'Tablet', Revenue: 19000, Units: 95, Month: 'February' },
    { Region: 'East', Product: 'Tablet', Revenue: 25000, Units: 125, Month: 'February' },
    { Region: 'West', Product: 'Tablet', Revenue: 21000, Units: 105, Month: 'February' },
    { Region: 'North', Product: 'Laptop', Revenue: 48000, Units: 160, Month: 'February' },
    { Region: 'South', Product: 'Laptop', Revenue: 42000, Units: 140, Month: 'February' },
    { Region: 'East', Product: 'Laptop', Revenue: 55000, Units: 183, Month: 'February' },
    { Region: 'West', Product: 'Laptop', Revenue: 44000, Units: 147, Month: 'February' },
    { Region: 'North', Product: 'Phone', Revenue: 34000, Units: 340, Month: 'March' },
    { Region: 'South', Product: 'Phone', Revenue: 31000, Units: 310, Month: 'March' },
    { Region: 'East', Product: 'Phone', Revenue: 38000, Units: 380, Month: 'March' },
    { Region: 'West', Product: 'Phone', Revenue: 33000, Units: 330, Month: 'March' },
  ],
};

// Sample Marketing Funnel Dataset
const marketingData = {
  rows: [
    { Stage: 'Awareness', Visitors: 50000, Channel: 'Organic', Campaign: 'Q1 Brand' },
    { Stage: 'Awareness', Visitors: 35000, Channel: 'Paid Ads', Campaign: 'Q1 Brand' },
    { Stage: 'Awareness', Visitors: 20000, Channel: 'Social', Campaign: 'Q1 Brand' },
    { Stage: 'Interest', Visitors: 25000, Channel: 'Organic', Campaign: 'Q1 Brand' },
    { Stage: 'Interest', Visitors: 18000, Channel: 'Paid Ads', Campaign: 'Q1 Brand' },
    { Stage: 'Interest', Visitors: 12000, Channel: 'Social', Campaign: 'Q1 Brand' },
    { Stage: 'Consideration', Visitors: 12000, Channel: 'Organic', Campaign: 'Q1 Brand' },
    { Stage: 'Consideration', Visitors: 9000, Channel: 'Paid Ads', Campaign: 'Q1 Brand' },
    { Stage: 'Consideration', Visitors: 6000, Channel: 'Social', Campaign: 'Q1 Brand' },
    { Stage: 'Intent', Visitors: 5000, Channel: 'Organic', Campaign: 'Q1 Brand' },
    { Stage: 'Intent', Visitors: 4000, Channel: 'Paid Ads', Campaign: 'Q1 Brand' },
    { Stage: 'Intent', Visitors: 2500, Channel: 'Social', Campaign: 'Q1 Brand' },
    { Stage: 'Purchase', Visitors: 2000, Channel: 'Organic', Campaign: 'Q1 Brand' },
    { Stage: 'Purchase', Visitors: 1800, Channel: 'Paid Ads', Campaign: 'Q1 Brand' },
    { Stage: 'Purchase', Visitors: 900, Channel: 'Social', Campaign: 'Q1 Brand' },
    { Stage: 'Loyalty', Visitors: 1500, Channel: 'Organic', Campaign: 'Q1 Brand' },
    { Stage: 'Loyalty', Visitors: 1200, Channel: 'Paid Ads', Campaign: 'Q1 Brand' },
    { Stage: 'Loyalty', Visitors: 600, Channel: 'Social', Campaign: 'Q1 Brand' },
  ],
};

// Sample Finance Dataset
const financeData = {
  rows: [
    { Category: 'Revenue', Quarter: 'Q1', Amount: 1250000, Year: 2024, Department: 'Sales' },
    { Category: 'Revenue', Quarter: 'Q2', Amount: 1380000, Year: 2024, Department: 'Sales' },
    { Category: 'Revenue', Quarter: 'Q3', Amount: 1520000, Year: 2024, Department: 'Sales' },
    { Category: 'Revenue', Quarter: 'Q4', Amount: 1680000, Year: 2024, Department: 'Sales' },
    { Category: 'Expenses', Quarter: 'Q1', Amount: 420000, Year: 2024, Department: 'Operations' },
    { Category: 'Expenses', Quarter: 'Q2', Amount: 455000, Year: 2024, Department: 'Operations' },
    { Category: 'Expenses', Quarter: 'Q3', Amount: 490000, Year: 2024, Department: 'Operations' },
    { Category: 'Expenses', Quarter: 'Q4', Amount: 510000, Year: 2024, Department: 'Operations' },
    { Category: 'Marketing', Quarter: 'Q1', Amount: 180000, Year: 2024, Department: 'Marketing' },
    { Category: 'Marketing', Quarter: 'Q2', Amount: 220000, Year: 2024, Department: 'Marketing' },
    { Category: 'Marketing', Quarter: 'Q3', Amount: 195000, Year: 2024, Department: 'Marketing' },
    { Category: 'Marketing', Quarter: 'Q4', Amount: 250000, Year: 2024, Department: 'Marketing' },
    { Category: 'Salaries', Quarter: 'Q1', Amount: 350000, Year: 2024, Department: 'HR' },
    { Category: 'Salaries', Quarter: 'Q2', Amount: 365000, Year: 2024, Department: 'HR' },
    { Category: 'Salaries', Quarter: 'Q3', Amount: 380000, Year: 2024, Department: 'HR' },
    { Category: 'Salaries', Quarter: 'Q4', Amount: 395000, Year: 2024, Department: 'HR' },
    { Category: 'R&D', Quarter: 'Q1', Amount: 150000, Year: 2024, Department: 'Engineering' },
    { Category: 'R&D', Quarter: 'Q2', Amount: 175000, Year: 2024, Department: 'Engineering' },
    { Category: 'R&D', Quarter: 'Q3', Amount: 200000, Year: 2024, Department: 'Engineering' },
    { Category: 'R&D', Quarter: 'Q4', Amount: 225000, Year: 2024, Department: 'Engineering' },
  ],
};

function createParsedData(name: string, rows: Record<string, any>[]): ParsedData {
  const headers = Object.keys(rows[0]);
  const columns: ColumnInfo[] = headers.map(header => {
    const values = rows.map(row => row[header]);
    const firstValue = values.find(v => v !== null && v !== undefined);
    const type = typeof firstValue === 'number' ? 'number' : 'string';
    return createColumn(header, type, values);
  });

  return {
    sheetName: name,
    headers,
    rows,
    columns,
    rowCount: rows.length,
    columnCount: headers.length,
  };
}

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  icon: string;
  data: ExcelFile;
}

export const sampleDatasets: SampleDataset[] = [
  {
    id: 'sales',
    name: 'Sales Performance',
    description: 'Regional sales by product and revenue',
    icon: '📊',
    data: {
      fileName: 'Sales_Performance_Sample.xlsx',
      sheets: [createParsedData('Sales Data', salesData.rows)],
      uploadedAt: new Date(),
    },
  },
  {
    id: 'marketing',
    name: 'Marketing Funnel',
    description: 'Conversion data across channels',
    icon: '📈',
    data: {
      fileName: 'Marketing_Funnel_Sample.xlsx',
      sheets: [createParsedData('Funnel Data', marketingData.rows)],
      uploadedAt: new Date(),
    },
  },
  {
    id: 'finance',
    name: 'Financial Summary',
    description: 'Quarterly revenue and expenses',
    icon: '💰',
    data: {
      fileName: 'Financial_Summary_Sample.xlsx',
      sheets: [createParsedData('Finance Data', financeData.rows)],
      uploadedAt: new Date(),
    },
  },
];

export function getSampleDataset(id: string): ExcelFile | null {
  const dataset = sampleDatasets.find(d => d.id === id);
  return dataset ? dataset.data : null;
}
