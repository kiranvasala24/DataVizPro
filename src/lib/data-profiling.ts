import { ParsedData, ColumnInfo } from './excel-parser';

export interface ColumnProfile {
  name: string;
  type: string;
  totalCount: number;
  uniqueCount: number;
  nullCount: number;
  nullPercentage: number;
  cardinality: 'low' | 'medium' | 'high' | 'unique';
  distribution: { value: string; count: number; percentage: number }[];
  
  // Numeric stats
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  range?: number;
  quartiles?: { q1: number; q2: number; q3: number };
  skewness?: 'left' | 'symmetric' | 'right';
  histogram?: { bin: string; count: number }[];
}

export interface CorrelationPair {
  column1: string;
  column2: string;
  correlation: number;
  strength: 'none' | 'weak' | 'moderate' | 'strong' | 'very_strong';
}

export interface DataProfile {
  columns: ColumnProfile[];
  correlations: CorrelationPair[];
  recommendations: string[];
}

function calculateMedian(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStdDev(values: number[], mean: number): number {
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationStrength(r: number): 'none' | 'weak' | 'moderate' | 'strong' | 'very_strong' {
  const abs = Math.abs(r);
  if (abs < 0.1) return 'none';
  if (abs < 0.3) return 'weak';
  if (abs < 0.5) return 'moderate';
  if (abs < 0.7) return 'strong';
  return 'very_strong';
}

function getCardinality(uniqueCount: number, totalCount: number): 'low' | 'medium' | 'high' | 'unique' {
  const ratio = uniqueCount / totalCount;
  if (ratio === 1) return 'unique';
  if (ratio > 0.5) return 'high';
  if (ratio > 0.1) return 'medium';
  return 'low';
}

function profileColumn(col: ColumnInfo, values: any[]): ColumnProfile {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const nullPercentage = ((values.length - nonNullValues.length) / values.length) * 100;
  
  // Calculate value distribution (top 10)
  const valueCounts = new Map<string, number>();
  nonNullValues.forEach(v => {
    const key = String(v);
    valueCounts.set(key, (valueCounts.get(key) || 0) + 1);
  });
  
  const distribution = Array.from(valueCounts.entries())
    .map(([value, count]) => ({
      value: value.length > 30 ? value.substring(0, 30) + '...' : value,
      count,
      percentage: (count / values.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const profile: ColumnProfile = {
    name: col.name,
    type: col.type,
    totalCount: values.length,
    uniqueCount: col.uniqueValues,
    nullCount: col.nullCount,
    nullPercentage,
    cardinality: getCardinality(col.uniqueValues, values.length),
    distribution,
  };

  // Add numeric stats
  if (col.type === 'number') {
    const numericValues = nonNullValues.map(Number).filter(n => !isNaN(n));
    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const median = calculateMedian(sorted);
      const stdDev = calculateStdDev(numericValues, mean);
      
      profile.mean = mean;
      profile.median = median;
      profile.stdDev = stdDev;
      profile.min = col.min;
      profile.max = col.max;
      profile.range = (col.max || 0) - (col.min || 0);
      
      profile.quartiles = {
        q1: sorted[Math.floor(sorted.length * 0.25)],
        q2: median,
        q3: sorted[Math.floor(sorted.length * 0.75)],
      };
      
      // Determine skewness
      if (mean < median - stdDev * 0.2) profile.skewness = 'left';
      else if (mean > median + stdDev * 0.2) profile.skewness = 'right';
      else profile.skewness = 'symmetric';
      
      // Create histogram
      const binCount = Math.min(10, Math.ceil(Math.sqrt(numericValues.length)));
      const binWidth = profile.range / binCount;
      const bins: number[] = new Array(binCount).fill(0);
      
      numericValues.forEach(v => {
        const binIndex = Math.min(binCount - 1, Math.floor((v - (col.min || 0)) / binWidth));
        bins[binIndex]++;
      });
      
      profile.histogram = bins.map((count, i) => ({
        bin: `${((col.min || 0) + i * binWidth).toFixed(1)}-${((col.min || 0) + (i + 1) * binWidth).toFixed(1)}`,
        count
      }));
    }
  }

  return profile;
}

export function generateDataProfile(sheet: ParsedData): DataProfile {
  const columns: ColumnProfile[] = [];
  const correlations: CorrelationPair[] = [];
  const recommendations: string[] = [];

  // Profile each column
  sheet.columns.forEach(col => {
    const values = sheet.rows.map(row => row[col.name]);
    columns.push(profileColumn(col, values));
  });

  // Calculate correlations between numeric columns
  const numericColumns = sheet.columns.filter(c => c.type === 'number');
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];
      
      const values1 = sheet.rows.map(row => Number(row[col1.name])).filter(v => !isNaN(v));
      const values2 = sheet.rows.map(row => Number(row[col2.name])).filter(v => !isNaN(v));
      
      if (values1.length >= 3 && values2.length >= 3) {
        const correlation = calculatePearsonCorrelation(values1, values2);
        correlations.push({
          column1: col1.name,
          column2: col2.name,
          correlation: Math.round(correlation * 1000) / 1000,
          strength: getCorrelationStrength(correlation),
        });
      }
    }
  }

  // Sort correlations by absolute value
  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  // Generate recommendations
  const highNullColumns = columns.filter(c => c.nullPercentage > 20);
  if (highNullColumns.length > 0) {
    recommendations.push(`Consider imputing or removing columns with high null rates: ${highNullColumns.map(c => c.name).join(', ')}`);
  }

  const uniqueIdColumns = columns.filter(c => c.cardinality === 'unique' && c.type === 'string');
  if (uniqueIdColumns.length > 0) {
    recommendations.push(`Potential ID columns detected: ${uniqueIdColumns.map(c => c.name).join(', ')}`);
  }

  const strongCorrelations = correlations.filter(c => c.strength === 'very_strong' || c.strength === 'strong');
  if (strongCorrelations.length > 0) {
    recommendations.push(`Strong correlations found between: ${strongCorrelations.slice(0, 3).map(c => `${c.column1} ↔ ${c.column2}`).join(', ')}`);
  }

  const skewedColumns = columns.filter(c => c.skewness && c.skewness !== 'symmetric');
  if (skewedColumns.length > 0) {
    recommendations.push(`Consider log transformation for skewed columns: ${skewedColumns.map(c => c.name).join(', ')}`);
  }

  return { columns, correlations, recommendations };
}
