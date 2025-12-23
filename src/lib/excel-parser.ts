import * as XLSX from 'xlsx';

export interface ColumnInfo {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  uniqueValues: number;
  nullCount: number;
  min?: number;
  max?: number;
  sum?: number;
  avg?: number;
}

export interface ParsedData {
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
  columns: ColumnInfo[];
  rowCount: number;
  columnCount: number;
}

export interface ExcelFile {
  fileName: string;
  sheets: ParsedData[];
  uploadedAt: Date;
}

function detectColumnType(values: any[]): 'number' | 'string' | 'date' | 'boolean' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';
  
  const booleanCount = nonNullValues.filter(v => typeof v === 'boolean' || v === 'true' || v === 'false').length;
  if (booleanCount / nonNullValues.length > 0.8) return 'boolean';
  
  const numberCount = nonNullValues.filter(v => !isNaN(Number(v)) && v !== '').length;
  if (numberCount / nonNullValues.length > 0.8) return 'number';
  
  const dateCount = nonNullValues.filter(v => {
    if (v instanceof Date) return true;
    const parsed = Date.parse(v);
    return !isNaN(parsed) && typeof v === 'string' && v.includes('/') || v.includes('-');
  }).length;
  if (dateCount / nonNullValues.length > 0.8) return 'date';
  
  return 'string';
}

function analyzeColumn(name: string, values: any[]): ColumnInfo {
  const type = detectColumnType(values);
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const uniqueValues = new Set(nonNullValues).size;
  const nullCount = values.length - nonNullValues.length;
  
  const info: ColumnInfo = {
    name,
    type,
    uniqueValues,
    nullCount,
  };
  
  if (type === 'number') {
    const numbers = nonNullValues.map(Number).filter(n => !isNaN(n));
    if (numbers.length > 0) {
      info.min = Math.min(...numbers);
      info.max = Math.max(...numbers);
      info.sum = numbers.reduce((a, b) => a + b, 0);
      info.avg = info.sum / numbers.length;
    }
  }
  
  return info;
}

export function parseExcelFile(file: File): Promise<ExcelFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        const sheets: ParsedData[] = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });
          
          if (jsonData.length === 0) {
            return {
              sheetName,
              headers: [],
              rows: [],
              columns: [],
              rowCount: 0,
              columnCount: 0,
            };
          }
          
          const headers = Object.keys(jsonData[0]);
          const columns = headers.map(header => {
            const values = jsonData.map(row => row[header]);
            return analyzeColumn(header, values);
          });
          
          return {
            sheetName,
            headers,
            rows: jsonData,
            columns,
            rowCount: jsonData.length,
            columnCount: headers.length,
          };
        });
        
        resolve({
          fileName: file.name,
          sheets: sheets.filter(s => s.rowCount > 0),
          uploadedAt: new Date(),
        });
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function generateChartSuggestions(columns: ColumnInfo[]): {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  xAxis: string;
  yAxis: string;
  title: string;
}[] {
  const suggestions: ReturnType<typeof generateChartSuggestions> = [];
  
  const numericColumns = columns.filter(c => c.type === 'number');
  const categoryColumns = columns.filter(c => c.type === 'string' && c.uniqueValues <= 20);
  const dateColumns = columns.filter(c => c.type === 'date');
  
  // Bar charts: category vs numeric
  categoryColumns.forEach(cat => {
    numericColumns.slice(0, 2).forEach(num => {
      suggestions.push({
        type: 'bar',
        xAxis: cat.name,
        yAxis: num.name,
        title: `${num.name} by ${cat.name}`,
      });
    });
  });
  
  // Line charts: date vs numeric
  dateColumns.forEach(date => {
    numericColumns.slice(0, 2).forEach(num => {
      suggestions.push({
        type: 'line',
        xAxis: date.name,
        yAxis: num.name,
        title: `${num.name} over Time`,
      });
    });
  });
  
  // Pie charts: category distribution
  categoryColumns.slice(0, 2).forEach(cat => {
    if (numericColumns.length > 0) {
      suggestions.push({
        type: 'pie',
        xAxis: cat.name,
        yAxis: numericColumns[0].name,
        title: `${numericColumns[0].name} Distribution by ${cat.name}`,
      });
    }
  });
  
  // Area charts
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      type: 'area',
      xAxis: dateColumns[0].name,
      yAxis: numericColumns[0].name,
      title: `${numericColumns[0].name} Trend`,
    });
  }
  
  // Scatter plots: numeric vs numeric
  if (numericColumns.length >= 2) {
    suggestions.push({
      type: 'scatter',
      xAxis: numericColumns[0].name,
      yAxis: numericColumns[1].name,
      title: `${numericColumns[0].name} vs ${numericColumns[1].name}`,
    });
  }
  
  return suggestions.slice(0, 6);
}

export function aggregateData(
  data: Record<string, any>[],
  groupBy: string,
  aggregateColumn: string,
  aggregationType: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
): { name: string; value: number }[] {
  const grouped: Record<string, number[]> = {};
  
  data.forEach(row => {
    const key = String(row[groupBy] || 'Unknown');
    const value = Number(row[aggregateColumn]);
    
    if (!grouped[key]) grouped[key] = [];
    if (!isNaN(value)) grouped[key].push(value);
  });
  
  return Object.entries(grouped).map(([name, values]) => {
    let value: number;
    switch (aggregationType) {
      case 'sum':
        value = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        value = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'count':
        value = values.length;
        break;
      case 'min':
        value = Math.min(...values);
        break;
      case 'max':
        value = Math.max(...values);
        break;
      default:
        value = values.reduce((a, b) => a + b, 0);
    }
    return { name, value: Math.round(value * 100) / 100 };
  }).sort((a, b) => b.value - a.value).slice(0, 10);
}
