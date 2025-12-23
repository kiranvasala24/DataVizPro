import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, ArrowRight, Copy, Check, Eye, X } from 'lucide-react';
import { sampleDatasets, SampleDataset } from '@/lib/sample-datasets';
import { ExcelFile } from '@/lib/excel-parser';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface SampleDatasetPickerProps {
  onSelect: (data: ExcelFile) => void;
}

function CopyableCell({ value }: { value: string | number }) {
  const [copied, setCopied] = useState(false);
  const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value ?? '');
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span 
      onClick={handleCopy}
      className="cursor-pointer hover:bg-primary/10 px-1 py-0.5 rounded transition-colors inline-flex items-center gap-1 group/cell"
      title="Click to copy"
    >
      {displayValue}
      {copied ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 transition-opacity" />
      )}
    </span>
  );
}

export function SampleDatasetPicker({ onSelect }: SampleDatasetPickerProps) {
  const [fullDataModal, setFullDataModal] = useState<SampleDataset | null>(null);

  const handleCopyCell = (value: string | number) => {
    navigator.clipboard.writeText(String(value));
    toast({
      title: "Copied!",
      description: "Cell value copied to clipboard",
    });
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-4xl mx-auto mt-8"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 mb-3">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Or try a sample dataset</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore the dashboard instantly without uploading your own data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sampleDatasets.map((dataset, index) => {
            const sheet = dataset.data.sheets[0];
            const headers = sheet.headers;
            const previewRows = sheet.rows.slice(0, 3);
            
            return (
              <motion.div
                key={dataset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-5 flex flex-col items-start gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group min-h-[160px]"
                      onClick={() => onSelect(dataset.data)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl">{dataset.icon}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{dataset.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {dataset.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{sheet.rowCount} rows</span>
                        <span>•</span>
                        <span>{sheet.columnCount} columns</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="p-0 bg-popover text-popover-foreground border border-border max-w-md"
                  >
                    <div className="p-2 border-b border-border flex items-center justify-between">
                      <p className="text-xs font-medium">Data Preview</p>
                      <span className="text-[10px] text-muted-foreground">Click cell to copy</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="text-xs w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            {headers.map((header, i) => (
                              <th key={i} className="px-2 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-border/50">
                              {headers.map((header, colIndex) => (
                                <td key={colIndex} className="px-1 py-1 whitespace-nowrap text-foreground">
                                  <CopyableCell value={row[header]} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-1.5 border-t border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        + {sheet.rowCount - 3} more rows
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullDataModal(dataset);
                        }}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View all
                      </button>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Full Data Modal */}
      <Dialog open={!!fullDataModal} onOpenChange={() => setFullDataModal(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{fullDataModal?.icon}</span>
              {fullDataModal?.name} - Full Dataset
            </DialogTitle>
          </DialogHeader>
          
          {fullDataModal && (
            <div className="flex-1 overflow-auto border border-border rounded-lg">
              <table className="text-sm w-full">
                <thead className="sticky top-0 bg-muted z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border text-xs">
                      #
                    </th>
                    {fullDataModal.data.sheets[0].headers.map((header, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap border-b border-border text-xs">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fullDataModal.data.sheets[0].rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {rowIndex + 1}
                      </td>
                      {fullDataModal.data.sheets[0].headers.map((header, colIndex) => (
                        <td 
                          key={colIndex} 
                          className="px-3 py-2 whitespace-nowrap text-foreground cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                          onClick={() => handleCopyCell(row[header])}
                          title="Click to copy"
                        >
                          {typeof row[header] === 'number' 
                            ? row[header].toLocaleString() 
                            : String(row[header] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border mt-2">
            <span>
              {fullDataModal?.data.sheets[0].rowCount} rows × {fullDataModal?.data.sheets[0].columnCount} columns
            </span>
            <span>Click any cell to copy its value</span>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
