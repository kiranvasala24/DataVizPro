// File validation constants and utilities

export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_ROW_COUNT: 100000,
  RECOMMENDED_ROW_COUNT: 50000,
  MAX_COLUMN_COUNT: 100,
  SUPPORTED_EXTENSIONS: ['.xlsx', '.xls', '.csv'],
  SUPPORTED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ],
} as const;

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFileSize(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (file.size > FILE_LIMITS.MAX_FILE_SIZE_BYTES) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size of ${FILE_LIMITS.MAX_FILE_SIZE_MB}MB`);
  } else if (file.size > FILE_LIMITS.MAX_FILE_SIZE_BYTES * 0.7) {
    warnings.push(`Large file (${formatFileSize(file.size)}). Processing may take longer.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateFileType(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidExtension = FILE_LIMITS.SUPPORTED_EXTENSIONS.includes(extension as any);
  const isValidMimeType = FILE_LIMITS.SUPPORTED_MIME_TYPES.includes(file.type as any);

  if (!isValidExtension && !isValidMimeType) {
    errors.push(`Invalid file type. Supported formats: ${FILE_LIMITS.SUPPORTED_EXTENSIONS.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateDataSize(rowCount: number, columnCount: number): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rowCount > FILE_LIMITS.MAX_ROW_COUNT) {
    errors.push(`Dataset has ${rowCount.toLocaleString()} rows, exceeding maximum of ${FILE_LIMITS.MAX_ROW_COUNT.toLocaleString()}`);
  } else if (rowCount > FILE_LIMITS.RECOMMENDED_ROW_COUNT) {
    warnings.push(`Large dataset (${rowCount.toLocaleString()} rows). Some features may be slower.`);
  }

  if (columnCount > FILE_LIMITS.MAX_COLUMN_COUNT) {
    errors.push(`Dataset has ${columnCount} columns, exceeding maximum of ${FILE_LIMITS.MAX_COLUMN_COUNT}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function combineValidationResults(...results: FileValidationResult[]): FileValidationResult {
  return {
    isValid: results.every(r => r.isValid),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings),
  };
}
