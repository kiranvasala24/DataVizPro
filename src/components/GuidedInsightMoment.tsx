import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Lightbulb, 
  TrendingUp, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParsedData, ColumnInfo } from '@/lib/excel-parser';
import { ChartConfig } from '@/lib/dashboard-storage';

interface GuidedInsight {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  chartType?: string;
  reason: string;
}

interface GuidedInsightMomentProps {
  sheet: ParsedData;
  chartConfigs: ChartConfig[];
  onDismiss: () => void;
  onNavigateToChart?: (chartType: string) => void;
}

export function GuidedInsightMoment({
  sheet,
  chartConfigs,
  onDismiss,
  onNavigateToChart,
}: GuidedInsightMomentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Generate guided insights based on data
  const generateGuidedInsights = (): GuidedInsight[] => {
    const insights: GuidedInsight[] = [];
    const numericCols = sheet.columns.filter(c => c.type === 'number');
    const categoryCols = sheet.columns.filter(c => c.type === 'string');

    // Insight 1: Best chart for the data
    if (chartConfigs.length > 0) {
      const firstChart = chartConfigs[0];
      insights.push({
        id: 'first-chart',
        title: 'Your First Visualization',
        description: `We created a ${firstChart.type} chart showing ${firstChart.yAxis} grouped by ${firstChart.xAxis}.`,
        icon: <TrendingUp className="w-5 h-5 text-primary" />,
        chartType: firstChart.type,
        reason: firstChart.type === 'bar' 
          ? 'Bar charts are great for comparing categories at a glance.'
          : firstChart.type === 'line'
          ? 'Line charts reveal trends over sequential data.'
          : firstChart.type === 'pie'
          ? 'Pie charts show proportions of a whole clearly.'
          : 'This chart type best fits your data structure.',
      });
    }

    // Insight 2: Data suitability
    if (numericCols.length > 0 && categoryCols.length > 0) {
      insights.push({
        id: 'data-suitable',
        title: 'Your Data is Well-Structured',
        description: `Found ${numericCols.length} numeric column${numericCols.length > 1 ? 's' : ''} and ${categoryCols.length} category column${categoryCols.length > 1 ? 's' : ''}.`,
        icon: <Lightbulb className="w-5 h-5 text-chart-3" />,
        reason: 'This mix is perfect for aggregated visualizations like bar charts and summaries.',
      });
    }

    // Insight 3: Key metric highlight
    if (numericCols.length > 0) {
      const colWithHighestSum = numericCols.reduce((max, col) => 
        (col.sum || 0) > (max.sum || 0) ? col : max
      , numericCols[0]);
      
      if (colWithHighestSum.sum) {
        insights.push({
          id: 'key-metric',
          title: 'Key Metric Identified',
          description: `"${colWithHighestSum.name}" has the highest total value: ${colWithHighestSum.sum.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
          icon: <Sparkles className="w-5 h-5 text-secondary" />,
          reason: 'Business users often start by analyzing the highest-impact metrics.',
        });
      }
    }

    // Insight 4: Suggested next step
    insights.push({
      id: 'next-step',
      title: 'Suggested Next Step',
      description: 'Try switching to "Executive" view for a high-level summary, or explore the Data Quality tab.',
      icon: <ArrowRight className="w-5 h-5 text-chart-5" />,
      reason: 'Different view modes help different audiences understand your data.',
    });

    return insights;
  };

  const insights = generateGuidedInsights();

  const handleNext = () => {
    if (currentIndex < insights.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible || insights.length === 0) return null;

  const currentInsight = insights[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-primary/30"
        style={{
          background: 'linear-gradient(135deg, hsl(174 72% 56% / 0.08) 0%, hsl(262 80% 65% / 0.08) 50%, hsl(196 80% 50% / 0.08) 100%)',
        }}
      >
        {/* Decorative glow */}
        <div 
          className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(174 72% 56% / 0.4) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 animate-pulse">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide">Guided Insight</p>
                <p className="text-xs text-muted-foreground">{currentIndex + 1} of {insights.length}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/50 flex-shrink-0">
                  {currentInsight.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{currentInsight.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{currentInsight.description}</p>
                </div>
              </div>

              {/* Reason box */}
              <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-chart-3 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-chart-3">Why this matters: </span>
                    {currentInsight.reason}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {insights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex 
                      ? 'bg-primary w-4' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant={currentIndex === insights.length - 1 ? 'default' : 'ghost'}
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentIndex === insights.length - 1 ? 'Got it!' : 'Next'}
              {currentIndex < insights.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
