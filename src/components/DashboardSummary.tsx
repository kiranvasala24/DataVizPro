import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Database,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DataQualityReport } from '@/lib/data-quality';
import { DataProfile } from '@/lib/data-profiling';
import { ParsedData } from '@/lib/excel-parser';
import { Button } from '@/components/ui/button';

interface DashboardSummaryProps {
  sheet: ParsedData;
  qualityReport: DataQualityReport;
  dataProfile: DataProfile;
  onNavigateToQuality?: () => void;
  onNavigateToProfiling?: () => void;
}

export function DashboardSummary({ 
  sheet, 
  qualityReport, 
  dataProfile,
  onNavigateToQuality,
  onNavigateToProfiling 
}: DashboardSummaryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const numericColumns = sheet.columns.filter(c => c.type === 'number');
  const categoricalColumns = sheet.columns.filter(c => c.type === 'string');
  const strongCorrelations = dataProfile.correlations.filter(c => 
    c.strength === 'strong' || c.strength === 'very_strong'
  );

  // Generate key insights
  const insights: { icon: typeof TrendingUp; text: string; type: 'positive' | 'neutral' | 'warning' }[] = [];

  // Quality insights
  if (qualityReport.overallScore >= 80) {
    insights.push({ icon: CheckCircle2, text: 'Data quality is excellent - ready for analysis', type: 'positive' });
  } else if (qualityReport.summary.criticalCount > 0) {
    insights.push({ icon: AlertTriangle, text: `${qualityReport.summary.criticalCount} critical quality issues require attention`, type: 'warning' });
  }

  // Correlation insights
  if (strongCorrelations.length > 0) {
    const top = strongCorrelations[0];
    insights.push({ 
      icon: Activity, 
      text: `Strong correlation (${(top.correlation * 100).toFixed(0)}%) between ${top.column1} and ${top.column2}`, 
      type: 'neutral' 
    });
  }

  // Skewness insights
  const skewedCols = dataProfile.columns.filter(c => c.skewness && c.skewness !== 'symmetric');
  if (skewedCols.length > 0) {
    insights.push({ 
      icon: skewedCols[0].skewness === 'right' ? TrendingUp : TrendingDown, 
      text: `${skewedCols.length} numeric column(s) show skewed distributions`, 
      type: 'neutral' 
    });
  }

  // High cardinality insights
  const uniqueIdCols = dataProfile.columns.filter(c => c.cardinality === 'unique');
  if (uniqueIdCols.length > 0) {
    insights.push({ 
      icon: Database, 
      text: `${uniqueIdCols.length} potential ID/unique column(s) detected`, 
      type: 'neutral' 
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Data Readiness Summary</h2>
            <p className="text-sm text-muted-foreground">Quick overview of your dataset</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Quality Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-lg border ${getScoreBg(qualityReport.overallScore)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Quality Score</span>
            {qualityReport.overallScore >= 70 ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(qualityReport.overallScore)}`}>
            {qualityReport.overallScore}/100
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {qualityReport.summary.totalIssues} issues found
          </p>
          {onNavigateToQuality && (
            <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={onNavigateToQuality}>
              View Details <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </motion.div>

        {/* Dataset Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-lg border border-border bg-muted/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Dataset Size</span>
            <Database className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {sheet.rowCount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            rows × {sheet.columnCount} columns
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
              {numericColumns.length} numeric
            </span>
            <span className="text-xs px-2 py-0.5 bg-secondary/50 text-secondary-foreground rounded">
              {categoricalColumns.length} categorical
            </span>
          </div>
        </motion.div>

        {/* Correlations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg border border-border bg-muted/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Relationships</span>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {strongCorrelations.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            strong correlations found
          </p>
          {onNavigateToProfiling && (
            <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={onNavigateToProfiling}>
              Explore <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </motion.div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Key Insights</h3>
          {insights.slice(0, 4).map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                insight.type === 'warning' 
                  ? 'border-yellow-500/20 bg-yellow-500/5' 
                  : insight.type === 'positive'
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-border bg-muted/20'
              }`}
            >
              <insight.icon className={`w-4 h-4 flex-shrink-0 ${
                insight.type === 'warning' ? 'text-yellow-500' :
                insight.type === 'positive' ? 'text-green-500' :
                'text-muted-foreground'
              }`} />
              <span className="text-sm text-foreground">{insight.text}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {dataProfile.recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {dataProfile.recommendations.slice(0, 3).map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary">•</span>
                {rec}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}