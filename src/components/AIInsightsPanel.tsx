import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  XCircle,
  BarChart3,
  LineChart,
  PieChart,
  Loader2,
  RefreshCw,
  Lightbulb,
  Clock,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AIInsight } from '@/hooks/useAIInsights';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  isLoading: boolean;
  error: string | null;
  isTimeout?: boolean;
  onRefresh: () => void;
  onInsightClick?: (insight: AIInsight) => void;
}

const categoryIcons = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  correlation: Activity,
  quality: CheckCircle2,
  pattern: Lightbulb,
};

const severityStyles = {
  info: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  warning: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
  success: 'border-green-500/20 bg-green-500/5 text-green-400',
  critical: 'border-red-500/20 bg-red-500/5 text-red-400',
};

const chartIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  scatter: Activity,
};

export function AIInsightsPanel({ 
  insights, 
  isLoading, 
  error, 
  isTimeout,
  onRefresh,
  onInsightClick 
}: AIInsightsPanelProps) {
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI-Powered Insights</h2>
            <p className="text-sm text-muted-foreground">
              {isTimeout ? 'Showing local analysis' : 'Automatically detected patterns and anomalies'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isTimeout && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs">
                    <Clock className="w-3 h-3" />
                    Timeout
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI request timed out. Using local analysis.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative p-4 rounded-full bg-primary/10">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">AI is analyzing your data...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take up to 30 seconds</p>
        </div>
      )}

      {error && !isLoading && insights.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Failed to generate insights</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && insights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lightbulb className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">No insights generated yet</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh}>
            Generate Insights
          </Button>
        </div>
      )}

      {!isLoading && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const CategoryIcon = categoryIcons[insight.category] || Lightbulb;
            const ChartIcon = insight.chartType ? chartIcons[insight.chartType] : null;
            const isExpanded = expandedInsight === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border transition-all ${severityStyles[insight.severity]}`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => onInsightClick?.(insight)}
                >
                  <div className="flex items-start gap-3">
                    <CategoryIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{insight.text}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded bg-background/50 text-muted-foreground capitalize">
                          {insight.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <div 
                            className="w-12 h-1.5 rounded-full bg-muted overflow-hidden"
                            title={`${insight.confidence}% confidence`}
                          >
                            <div 
                              className="h-full bg-current rounded-full" 
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                          {insight.confidence}%
                        </span>
                        {insight.relatedColumns.length > 0 && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {insight.relatedColumns.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ChartIcon && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-1 rounded bg-background/30">
                                <ChartIcon className="w-4 h-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Suggested: {insight.chartType} chart</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {(insight.explanation || insight.dataPoints?.length) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedInsight(isExpanded ? null : index);
                          }}
                          className="p-1 rounded hover:bg-background/30 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Explainability section */}
                {isExpanded && (insight.explanation || insight.dataPoints?.length) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 pt-0"
                  >
                    <div className="border-t border-current/10 pt-3 mt-1">
                      {insight.explanation && (
                        <div className="flex items-start gap-2 mb-2">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                          <p className="text-xs text-muted-foreground">{insight.explanation}</p>
                        </div>
                      )}
                      {insight.dataPoints && insight.dataPoints.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Data points:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {insight.dataPoints.map((point, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
