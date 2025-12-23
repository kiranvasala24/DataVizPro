import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { parseExcelFile, ExcelFile } from '@/lib/excel-parser';
import { validateFileSize, validateFileType, validateDataSize, combineValidationResults, FILE_LIMITS, formatFileSize } from '@/lib/file-validation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onFileProcessed: (data: ExcelFile) => void;
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setWarnings([]);
    
    // Validate file size and type first
    const sizeValidation = validateFileSize(file);
    const typeValidation = validateFileType(file);
    const preValidation = combineValidationResults(sizeValidation, typeValidation);

    if (!preValidation.isValid) {
      preValidation.errors.forEach(error => {
        toast({
          title: 'Invalid file',
          description: error,
          variant: 'destructive',
        });
      });
      return;
    }

    // Show warnings
    if (preValidation.warnings.length > 0) {
      setWarnings(preValidation.warnings);
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const parsedData = await parseExcelFile(file);
      
      if (parsedData.sheets.length === 0) {
        throw new Error('No data found in the file');
      }

      // Validate data size
      const sheet = parsedData.sheets[0];
      const dataValidation = validateDataSize(sheet.rowCount, sheet.columnCount);
      
      if (!dataValidation.isValid) {
        dataValidation.errors.forEach(error => {
          toast({
            title: 'Dataset too large',
            description: error,
            variant: 'destructive',
          });
        });
        setSelectedFile(null);
        return;
      }

      // Combine all warnings
      const allWarnings = [...preValidation.warnings, ...dataValidation.warnings];
      setWarnings(allWarnings);

      toast({
        title: 'File processed successfully!',
        description: `Found ${parsedData.sheets.length} sheet(s) with ${sheet.rowCount.toLocaleString()} rows.`,
      });

      onFileProcessed(parsedData);
    } catch (error) {
      toast({
        title: 'Error processing file',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setWarnings([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Warnings */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            {warnings.map((warning, i) => (
              <Alert key={i} className="mb-2 border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-200">{warning}</AlertDescription>
              </Alert>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`upload-zone p-12 ${isDragging ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Processing your file...</p>
                <p className="text-sm text-muted-foreground mt-1">Analyzing data structure and generating insights</p>
              </div>
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-chart-5" />
                <div className="absolute inset-0 blur-xl bg-chart-5/30" />
              </div>
              <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{selectedFile.name}</span>
                <button
                  onClick={clearFile}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.label
              key="upload"
              htmlFor="file-upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 cursor-pointer"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Upload className="w-16 h-16 text-primary" />
                </motion.div>
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse-glow" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-primary hover:underline">browse</span> to choose a file
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Supports .xlsx, .xls, and .csv files
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Max {FILE_LIMITS.MAX_FILE_SIZE_MB}MB • Up to {FILE_LIMITS.MAX_ROW_COUNT.toLocaleString()} rows
                </p>
              </div>
            </motion.label>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
