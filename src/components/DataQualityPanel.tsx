import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  Lightbulb,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { DataQualityReport, DataQualityIssue, SeverityLevel } from '@/lib/data-quality';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DataQualityPanelProps {
  report: DataQualityReport;
}

const severityConfig: Record<SeverityLevel, { icon: React.ElementType; color: string; bgColor: string }> = {
  critical: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  high: { icon: AlertCircle, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  medium: { icon: AlertTriangle, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  low: { icon: Info, color: 'text-chart-6', bgColor: 'bg-chart-6/10' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-chart-5';
  if (score >= 60) return 'text-chart-3';
  if (score >= 40) return 'text-chart-4';
  return 'text-destructive';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

function IssueCard({ issue, index }: { issue: DataQualityIssue; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={`glass-card p-4 ${config.bgColor} border-l-4`} style={{ borderLeftColor: `hsl(var(--${issue.severity === 'critical' ? 'destructive' : issue.severity === 'high' ? 'chart-4' : issue.severity === 'medium' ? 'chart-3' : 'chart-6'}))` }}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full p-0 h-auto hover:bg-transparent justify-between">
              <div className="flex items-start gap-3 text-left">
                <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{issue.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">{issue.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{issue.affectedRows} rows affected</span>
                  </div>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              <p className="text-sm text-muted-foreground">{issue.details}</p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-sm text-foreground">{issue.suggestion}</p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
}

export function DataQualityPanel({ report }: DataQualityPanelProps) {
  const scoreColor = getScoreColor(report.overallScore);
  const scoreLabel = getScoreLabel(report.overallScore);

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Data Quality Score</h3>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${scoreColor}`} />
            <span className={`text-2xl font-bold ${scoreColor}`}>{report.overallScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
        
        <Progress value={report.overallScore} className="h-3 mb-3" />
        
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${scoreColor}`}>{scoreLabel}</span>
          <div className="flex gap-4 text-muted-foreground">
            {report.summary.criticalCount > 0 && (
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" /> {report.summary.criticalCount} Critical
              </span>
            )}
            {report.summary.highCount > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-chart-4" /> {report.summary.highCount} High
              </span>
            )}
            {report.summary.mediumCount > 0 && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-chart-3" /> {report.summary.mediumCount} Medium
              </span>
            )}
            {report.summary.lowCount > 0 && (
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-chart-6" /> {report.summary.lowCount} Low
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Column Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Column Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(report.columnHealth).map(([column, health], index) => (
            <motion.div
              key={column}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.02 }}
              className="p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${getScoreColor(health)}`}>{health}%</span>
              </div>
              <p className="text-xs text-muted-foreground truncate" title={column}>{column}</p>
              <Progress value={health} className="h-1.5 mt-2" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Issues List */}
      {report.issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Issues Found</h3>
          {report.issues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} index={index} />
          ))}
        </div>
      )}

      {report.issues.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-chart-5 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Excellent Data Quality!</h3>
          <p className="text-muted-foreground">No significant issues detected in your dataset.</p>
        </motion.div>
      )}
    </div>
  );
}
