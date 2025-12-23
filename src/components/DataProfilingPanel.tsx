import { motion } from 'framer-motion';
import { 
  Database, 
  TrendingUp, 
  BarChart3, 
  ArrowLeftRight,
  Lightbulb,
  Hash,
  Type,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { DataProfile, ColumnProfile, CorrelationPair } from '@/lib/data-profiling';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataProfilingPanelProps {
  profile: DataProfile;
}

const typeIcons: Record<string, React.ElementType> = {
  number: Hash,
  string: Type,
  date: Calendar,
  boolean: ChevronRight,
};

const cardinalityColors: Record<string, string> = {
  low: 'text-chart-5',
  medium: 'text-chart-3',
  high: 'text-chart-4',
  unique: 'text-primary',
};

function ColumnCard({ column, index }: { column: ColumnProfile; index: number }) {
  const Icon = typeIcons[column.type] || Type;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground truncate max-w-[150px]" title={column.name}>
              {column.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs capitalize">{column.type}</Badge>
              <Badge variant="secondary" className={`text-xs ${cardinalityColors[column.cardinality]}`}>
                {column.cardinality} cardinality
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Unique Values</span>
          <span className="font-medium text-foreground">{column.uniqueCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Missing</span>
          <span className={`font-medium ${column.nullPercentage > 10 ? 'text-chart-4' : 'text-foreground'}`}>
            {column.nullPercentage.toFixed(1)}%
          </span>
        </div>
        
        {column.type === 'number' && column.mean !== undefined && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mean</span>
              <span className="font-medium text-foreground">{column.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Std Dev</span>
              <span className="font-medium text-foreground">{column.stdDev?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Range</span>
              <span className="font-medium text-foreground font-mono text-xs">
                {column.min?.toFixed(1)} → {column.max?.toFixed(1)}
              </span>
            </div>
            {column.skewness && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skewness</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {column.skewness}
                </Badge>
              </div>
            )}
          </>
        )}
      </div>

      {/* Distribution Mini Chart */}
      {column.histogram && column.histogram.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Distribution</p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={column.histogram}>
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {column.histogram.map((_, i) => (
                    <Cell key={i} fill={`hsl(var(--primary))`} opacity={0.7 + i * 0.03} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Values */}
      {column.distribution.length > 0 && column.type === 'string' && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Top Values</p>
          <div className="space-y-2">
            {column.distribution.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{item.value}</p>
                  <Progress value={item.percentage} className="h-1 mt-1" />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CorrelationMatrix({ correlations }: { correlations: CorrelationPair[] }) {
  if (correlations.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Not enough numeric columns for correlation analysis</p>
      </div>
    );
  }

  const getCorrelationColor = (r: number) => {
    const abs = Math.abs(r);
    if (abs > 0.7) return r > 0 ? 'bg-chart-5' : 'bg-chart-4';
    if (abs > 0.5) return r > 0 ? 'bg-chart-5/70' : 'bg-chart-4/70';
    if (abs > 0.3) return r > 0 ? 'bg-chart-5/50' : 'bg-chart-4/50';
    return 'bg-muted';
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <ArrowLeftRight className="w-5 h-5 text-primary" />
        Correlation Matrix
      </h3>
      <div className="space-y-3">
        {correlations.slice(0, 10).map((corr, index) => (
          <motion.div
            key={`${corr.column1}-${corr.column2}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4"
          >
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-sm text-foreground truncate max-w-[120px]" title={corr.column1}>
                {corr.column1}
              </span>
              <ArrowLeftRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground truncate max-w-[120px]" title={corr.column2}>
                {corr.column2}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getCorrelationColor(corr.correlation)} transition-all`}
                  style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-mono w-16 text-right ${
                Math.abs(corr.correlation) > 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(3)}
              </span>
              <Badge variant="outline" className="text-xs capitalize w-20 justify-center">
                {corr.strength}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DataProfilingPanel({ profile }: DataProfilingPanelProps) {
  return (
    <Tabs defaultValue="columns" className="space-y-6">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="columns" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Columns ({profile.columns.length})
        </TabsTrigger>
        <TabsTrigger value="correlations" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Correlations ({profile.correlations.length})
        </TabsTrigger>
        <TabsTrigger value="recommendations" className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="columns" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.columns.map((column, index) => (
            <ColumnCard key={column.name} column={column} index={index} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="correlations" className="mt-0">
        <CorrelationMatrix correlations={profile.correlations} />
      </TabsContent>

      <TabsContent value="recommendations" className="mt-0">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            AI Recommendations
          </h3>
          {profile.recommendations.length > 0 ? (
            <div className="space-y-3">
              {profile.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <BarChart3 className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">{rec}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No specific recommendations for this dataset.
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
