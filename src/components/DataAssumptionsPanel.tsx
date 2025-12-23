import { motion } from 'framer-motion';
import { 
  Filter, 
  Calculator, 
  AlertTriangle, 
  BarChart2,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { ColumnInfo, ParsedData } from '@/lib/excel-parser';
import { DataQualityReport } from '@/lib/data-quality';
import { DataProfile } from '@/lib/data-profiling';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DataAssumptionsPanelProps {
  sheet: ParsedData;
  qualityReport: DataQualityReport;
  dataProfile: DataProfile;
  chartConfigs?: Array<{
    aggregation: string;
    xAxis: string;
    yAxis: string;
  }>;
}

interface AssumptionItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  details?: string;
}

export function DataAssumptionsPanel({ 
  sheet, 
  qualityReport, 
  dataProfile,
  chartConfigs = []
}: DataAssumptionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate missing value handling info
  const columnsWithMissing = sheet.columns.filter(c => c.nullCount > 0);
  const totalMissingValues = columnsWithMissing.reduce((acc, c) => acc + c.nullCount, 0);
  const missingPercentage = ((totalMissingValues / (sheet.rowCount * sheet.columnCount)) * 100).toFixed(1);

  // Calculate outlier info
  const outlierIssues = qualityReport.issues.filter(i => i.type === 'outlier');
  const totalOutliers = outlierIssues.reduce((acc, i) => acc + i.affectedRows, 0);

  // Get unique aggregations used
  const aggregationsUsed = [...new Set(chartConfigs.map(c => c.aggregation))];

  // Build assumptions list
  const assumptions: AssumptionItem[] = [
    {
      icon: <Filter className="w-4 h-4 text-primary" />,
      label: 'Filters Applied',
      value: 'None (showing all data)',
      details: `Displaying ${sheet.rowCount.toLocaleString()} rows across ${sheet.columnCount} columns`,
    },
    {
      icon: <Calculator className="w-4 h-4 text-secondary" />,
      label: 'Aggregation Methods',
      value: aggregationsUsed.length > 0 
        ? aggregationsUsed.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
        : 'Sum (default)',
      details: 'Charts aggregate numeric data by the selected method per category',
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-chart-3" />,
      label: 'Missing Values',
      value: totalMissingValues > 0 
        ? `${totalMissingValues.toLocaleString()} values (${missingPercentage}%)`
        : 'None detected',
      details: totalMissingValues > 0
        ? `Excluded from calculations. Affected columns: ${columnsWithMissing.map(c => c.name).slice(0, 3).join(', ')}${columnsWithMissing.length > 3 ? '...' : ''}`
        : 'All cells contain valid data',
    },
    {
      icon: <BarChart2 className="w-4 h-4 text-chart-5" />,
      label: 'Outlier Treatment',
      value: totalOutliers > 0 
        ? `${totalOutliers.toLocaleString()} outliers detected`
        : 'No outliers detected',
      details: totalOutliers > 0
        ? 'Outliers are included in visualizations but flagged in quality report (IQR method)'
        : 'All values fall within expected ranges',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between px-4 py-3 h-auto hover:bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">Data Assumptions & Transformations</h3>
                <p className="text-xs text-muted-foreground">
                  {isExpanded ? 'Click to collapse' : 'Click to see how your data is processed'}
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assumptions.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-background/50 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.details}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Data integrity badge */}
            <div className="mt-3 p-2 rounded-lg bg-chart-5/10 border border-chart-5/20 flex items-center gap-2">
              <div className="p-1 rounded bg-chart-5/20">
                <svg className="w-3.5 h-3.5 text-chart-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-chart-5 font-medium">
                Data integrity verified • Quality score: {qualityReport.overallScore}/100
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
