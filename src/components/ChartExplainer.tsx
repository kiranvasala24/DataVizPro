import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  X, 
  ChartBar, 
  Wand2,
  ArrowRight,
  Layers,
  Sigma,
  AlertTriangle
} from 'lucide-react';
import { ChartExplanation, explainChartChoice } from '@/lib/chart-explainability';
import { ColumnInfo } from '@/lib/excel-parser';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChartExplainerProps {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  xColumn: ColumnInfo;
  yColumn: ColumnInfo;
  aggregation?: string;
}

export function ChartExplainer({ chartType, xColumn, yColumn, aggregation = 'sum' }: ChartExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const explanation = explainChartChoice(chartType, xColumn, yColumn, aggregation);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-7 w-7 p-0 opacity-50 hover:opacity-100 transition-opacity"
        title="Why this chart?"
      >
        <Info className="w-3.5 h-3.5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <ChartBar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{explanation.chartType}</h2>
                    <p className="text-sm text-muted-foreground">Chart Explainability</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Why Chosen */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Why This Chart?</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{explanation.whyChosen}</p>
                </section>

                {/* Data Relationship */}
                <section className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-foreground">Data Relationship</h4>
                  </div>
                  <p className="text-sm text-foreground font-mono">{explanation.dataRelationship}</p>
                </section>

                {/* Transformations */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Transformations Applied</h3>
                  </div>
                  <ul className="space-y-2">
                    {explanation.transformations.map((t, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t}
                      </motion.li>
                    ))}
                  </ul>
                </section>

                {/* Aggregation */}
                <section className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sigma className="w-4 h-4 text-secondary" />
                    <h4 className="font-medium text-foreground">Aggregation</h4>
                  </div>
                  <p className="text-sm text-foreground">{explanation.aggregation}</p>
                </section>

                {/* Best For */}
                <section>
                  <h3 className="font-semibold text-foreground mb-3">Best For</h3>
                  <div className="flex flex-wrap gap-2">
                    {explanation.bestFor.map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* Limitations */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-chart-3" />
                    <h3 className="font-semibold text-foreground">Limitations</h3>
                  </div>
                  <ul className="space-y-2">
                    {explanation.limitations.map((l, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-chart-3" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Alternatives */}
                <section>
                  <h3 className="font-semibold text-foreground mb-3">Alternative Charts</h3>
                  <div className="flex flex-wrap gap-2">
                    {explanation.alternativeCharts.map((alt, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
