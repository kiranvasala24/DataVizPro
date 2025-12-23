import { motion } from 'framer-motion';
import { Info, CheckCircle, XCircle, FileSpreadsheet, Users, Target } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProductBoundariesProps {
  rowCount?: number;
  variant?: 'banner' | 'footer';
}

export function ProductBoundaries({ rowCount, variant = 'banner' }: ProductBoundariesProps) {
  const isLargeDataset = rowCount && rowCount > 50000;
  
  if (variant === 'footer') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-t border-border/50 py-6"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Best for datasets under 100K rows</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Performance may degrade with very large files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <span className="text-border">•</span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Target className="w-3.5 h-3.5" />
                    <span>For exploratory analysis, not BI replacement</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Great for quick insights and data exploration</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <span className="text-border">•</span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Users className="w-3.5 h-3.5" />
                    <span>Built for data scientists & analysts</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Designed for quick data validation and exploration</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-muted/30 border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-4">
            {/* Dataset size indicator */}
            {rowCount && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                isLargeDataset 
                  ? 'bg-yellow-500/10 text-yellow-500' 
                  : 'bg-chart-5/10 text-chart-5'
              }`}>
                {isLargeDataset ? (
                  <XCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                <span>{rowCount.toLocaleString()} rows</span>
                {isLargeDataset && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Large datasets may have slower performance</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
            
            {/* Use cases */}
            <div className="hidden md:flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-chart-5" />
                Quick CSV exploration
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-chart-5" />
                Data quality validation
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-chart-5" />
                Executive summaries
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
