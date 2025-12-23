import { ColumnInfo, ParsedData } from './excel-parser';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DataQualityIssue {
  id: string;
  type: 'missing' | 'outlier' | 'duplicate' | 'mixed_type' | 'inconsistent';
  column?: string;
  severity: SeverityLevel;
  message: string;
  details: string;
  affectedRows: number;
  percentage: number;
  suggestion: string;
}

export interface DataQualityReport {
  overallScore: number;
  issues: DataQualityIssue[];
  summary: {
    totalIssues: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  columnHealth: Record<string, number>;
}

function calculateStdDev(values: number[], mean: number): number {
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}

function detectOutliers(values: number[]): { outliers: number[]; count: number } {
  if (values.length < 4) return { outliers: [], count: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = values.filter(v => v < lowerBound || v > upperBound);
  return { outliers, count: outliers.length };
}

function detectMixedTypes(values: any[]): { hasMixed: boolean; types: string[] } {
  const types = new Set<string>();
  values.forEach(v => {
    if (v === null || v === undefined || v === '') return;
    if (!isNaN(Number(v)) && typeof v !== 'boolean') types.add('number');
    else if (typeof v === 'boolean' || v === 'true' || v === 'false') types.add('boolean');
    else if (v instanceof Date || (!isNaN(Date.parse(v)) && (v.includes('/') || v.includes('-')))) types.add('date');
    else types.add('string');
  });
  return { hasMixed: types.size > 1, types: Array.from(types) };
}

function findDuplicates(rows: Record<string, any>[]): { duplicateRows: number; duplicateGroups: number } {
  const seen = new Map<string, number>();
  let duplicateRows = 0;
  
  rows.forEach(row => {
    const key = JSON.stringify(row);
    const count = seen.get(key) || 0;
    if (count > 0) duplicateRows++;
    seen.set(key, count + 1);
  });
  
  const duplicateGroups = Array.from(seen.values()).filter(c => c > 1).length;
  return { duplicateRows, duplicateGroups };
}

export function analyzeDataQuality(sheet: ParsedData): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const columnHealth: Record<string, number> = {};
  let issueId = 0;

  // Analyze each column
  sheet.columns.forEach((col, colIndex) => {
    const values = sheet.rows.map(row => row[col.name]);
    let columnScore = 100;

    // Check for missing values
    const missingPercentage = (col.nullCount / sheet.rowCount) * 100;
    if (missingPercentage > 0) {
      let severity: SeverityLevel = 'low';
      if (missingPercentage > 50) severity = 'critical';
      else if (missingPercentage > 25) severity = 'high';
      else if (missingPercentage > 10) severity = 'medium';

      if (missingPercentage > 5) {
        issues.push({
          id: `issue-${issueId++}`,
          type: 'missing',
          column: col.name,
          severity,
          message: `${missingPercentage.toFixed(1)}% missing values in "${col.name}"`,
          details: `${col.nullCount} out of ${sheet.rowCount} rows have missing values in this column.`,
          affectedRows: col.nullCount,
          percentage: missingPercentage,
          suggestion: severity === 'critical' 
            ? 'Consider removing this column or imputing values'
            : 'Fill missing values with mean/median or forward-fill'
        });
        columnScore -= Math.min(missingPercentage, 50);
      }
    }

    // Check for outliers in numeric columns
    if (col.type === 'number') {
      const numericValues = values.filter(v => v !== null && !isNaN(Number(v))).map(Number);
      const { count: outlierCount } = detectOutliers(numericValues);
      const outlierPercentage = (outlierCount / numericValues.length) * 100;

      if (outlierPercentage > 1) {
        let severity: SeverityLevel = 'low';
        if (outlierPercentage > 15) severity = 'high';
        else if (outlierPercentage > 5) severity = 'medium';

        issues.push({
          id: `issue-${issueId++}`,
          type: 'outlier',
          column: col.name,
          severity,
          message: `${outlierPercentage.toFixed(1)}% outliers detected in "${col.name}"`,
          details: `${outlierCount} values fall outside the interquartile range (IQR). Range: ${col.min?.toFixed(2)} - ${col.max?.toFixed(2)}`,
          affectedRows: outlierCount,
          percentage: outlierPercentage,
          suggestion: 'Review outliers for data entry errors or consider capping/transforming values'
        });
        columnScore -= Math.min(outlierPercentage * 2, 30);
      }
    }

    // Check for mixed types
    const { hasMixed, types } = detectMixedTypes(values);
    if (hasMixed) {
      issues.push({
        id: `issue-${issueId++}`,
        type: 'mixed_type',
        column: col.name,
        severity: 'medium',
        message: `Mixed data types in "${col.name}"`,
        details: `Column contains multiple types: ${types.join(', ')}. This may cause analysis issues.`,
        affectedRows: sheet.rowCount,
        percentage: 100,
        suggestion: 'Convert to a consistent type or split into separate columns'
      });
      columnScore -= 20;
    }

    columnHealth[col.name] = Math.max(0, Math.round(columnScore));
  });

  // Check for duplicate rows
  const { duplicateRows, duplicateGroups } = findDuplicates(sheet.rows);
  if (duplicateRows > 0) {
    const duplicatePercentage = (duplicateRows / sheet.rowCount) * 100;
    let severity: SeverityLevel = 'low';
    if (duplicatePercentage > 20) severity = 'high';
    else if (duplicatePercentage > 10) severity = 'medium';

    issues.push({
      id: `issue-${issueId++}`,
      type: 'duplicate',
      severity,
      message: `${duplicateRows} duplicate rows detected`,
      details: `Found ${duplicateGroups} groups of duplicate rows (${duplicatePercentage.toFixed(1)}% of data).`,
      affectedRows: duplicateRows,
      percentage: duplicatePercentage,
      suggestion: 'Remove duplicate rows to ensure data integrity'
    });
  }

  // Sort issues by severity
  const severityOrder: Record<SeverityLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Calculate overall score
  const avgColumnHealth = Object.values(columnHealth).reduce((a, b) => a + b, 0) / Object.keys(columnHealth).length;
  const issuesPenalty = Math.min(issues.length * 5, 30);
  const overallScore = Math.max(0, Math.round(avgColumnHealth - issuesPenalty));

  return {
    overallScore,
    issues,
    summary: {
      totalIssues: issues.length,
      criticalCount: issues.filter(i => i.severity === 'critical').length,
      highCount: issues.filter(i => i.severity === 'high').length,
      mediumCount: issues.filter(i => i.severity === 'medium').length,
      lowCount: issues.filter(i => i.severity === 'low').length,
    },
    columnHealth,
  };
}
