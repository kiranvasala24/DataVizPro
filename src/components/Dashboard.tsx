import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Rows3, 
  Columns3, 
  Hash, 
  ArrowUpDown,
  RefreshCw,
  LayoutDashboard,
  Shield,
  Database,
  LayoutGrid,
  Square,
  Sparkles,
  Loader2
} from 'lucide-react';
import { ExcelFile, generateChartSuggestions } from '@/lib/excel-parser';
import { analyzeDataQuality } from '@/lib/data-quality';
import { generateDataProfile } from '@/lib/data-profiling';
import { ChartConfig } from '@/lib/dashboard-storage';
import { StatCard } from './StatCard';
import { DataTable } from './DataTable';
import { ConfigurableChart } from './ConfigurableChart';
import { DashboardSummary } from './DashboardSummary';
import { DataAssumptionsPanel } from './DataAssumptionsPanel';
import { ShareExportPanel } from './ShareExportPanel';
import { GuidedInsightMoment } from './GuidedInsightMoment';
import { PrivacyBadge } from './PrivacyBadge';
import { ProductBoundaries } from './ProductBoundaries';
import { VersionBadge } from './VersionBadge';
import { IntentionalFailureUX } from './IntentionalFailureUX';

import { AIInsightsPanel } from './AIInsightsPanel';
import { ViewModeSelector, ViewMode, ViewModeDescription } from './ViewModeSelector';
import { DashboardVersioning } from './DashboardVersioning';
import { useAIInsights, AIInsight } from '@/hooks/useAIInsights';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy panels
const DataQualityPanel = lazy(() => import('./DataQualityPanel').then(m => ({ default: m.DataQualityPanel })));
const DataProfilingPanel = lazy(() => import('./DataProfilingPanel').then(m => ({ default: m.DataProfilingPanel })));

interface DashboardProps {
  data: ExcelFile;
  onReset: () => void;
}

// Loading skeleton for lazy-loaded panels
function PanelSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export function Dashboard({ data, onReset }: DashboardProps) {
  const [activeSheet, setActiveSheet] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('analyst');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gridCols, setGridCols] = useState<1 | 2>(1);
  const [showGuidedInsight, setShowGuidedInsight] = useState(true);
  
  const sheet = data.sheets[activeSheet];
  
  // Memoize expensive computations
  const chartSuggestions = useMemo(() => generateChartSuggestions(sheet.columns), [sheet.columns]);
  const qualityReport = useMemo(() => analyzeDataQuality(sheet), [sheet]);
  const dataProfile = useMemo(() => generateDataProfile(sheet), [sheet]);
  
  // AI Insights with timeout/fallback support
  const { insights, isLoading: insightsLoading, error: insightsError, isTimeout, generateInsights } = useAIInsights();
  
  // Debounced insight generation when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateInsights(sheet, qualityReport, dataProfile);
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timeoutId);
  }, [sheet.sheetName]); // Re-run when sheet changes
  
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>(() => 
    chartSuggestions.map((s, i) => ({
      id: `chart-${i}`,
      type: s.type,
      xAxis: s.xAxis,
      yAxis: s.yAxis,
      aggregation: 'sum',
      title: s.title,
      layout: { x: i % 2, y: Math.floor(i / 2), w: 1, h: 1 },
    }))
  );

  // Memoize derived values
  const numericColumns = useMemo(() => sheet.columns.filter(c => c.type === 'number'), [sheet.columns]);
  const categoryColumns = useMemo(() => sheet.columns.filter(c => c.type === 'string'), [sheet.columns]);
  
  const { totalSum, avgValue } = useMemo(() => {
    const sum = numericColumns.reduce((acc, col) => acc + (col.sum || 0), 0);
    const avg = numericColumns.length > 0 
      ? numericColumns.reduce((acc, col) => acc + (col.avg || 0), 0) / numericColumns.length 
      : 0;
    return { totalSum: sum, avgValue: avg };
  }, [numericColumns]);

  // Memoized callbacks
  const handleConfigChange = useCallback((index: number, updates: Partial<ChartConfig>) => {
    setChartConfigs(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  }, []);
  
  const handleInsightClick = useCallback((insight: AIInsight) => {
    if (insight.chartType) {
      const vizSection = document.querySelector('[data-section="visualizations"]');
      vizSection?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleRefreshInsights = useCallback(() => {
    generateInsights(sheet, qualityReport, dataProfile);
  }, [generateInsights, sheet, qualityReport, dataProfile]);

  // Memoize view mode conditions
  const { showDetailedStats, showQuality, showProfiling, maxCharts } = useMemo(() => ({
    showDetailedStats: viewMode === 'analyst',
    showQuality: viewMode === 'analyst',
    showProfiling: viewMode === 'analyst' || viewMode === 'business',
    maxCharts: viewMode === 'executive' ? 2 : viewMode === 'business' ? 4 : chartConfigs.length,
  }), [viewMode, chartConfigs.length]);

  // Memoize visible charts
  const visibleCharts = useMemo(() => chartConfigs.slice(0, maxCharts), [chartConfigs, maxCharts]);

  return (
    <div className="min-h-screen bg-background">
      {/* Product Boundaries Banner */}
      <ProductBoundaries rowCount={sheet.rowCount} variant="banner" />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{data.fileName}</h1>
                <p className="text-sm text-muted-foreground">
                  {data.sheets.length} sheet{data.sheets.length > 1 ? 's' : ''} • Score: {qualityReport.overallScore}/100
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <VersionBadge variant="minimal" />
              <PrivacyBadge />
              <ViewModeSelector currentMode={viewMode} onModeChange={setViewMode} />
              <ShareExportPanel
                fileName={data.fileName}
                sheet={sheet}
                qualityReport={qualityReport}
                insights={insights}
                chartConfigs={chartConfigs}
              />
              <DashboardVersioning
                fileName={data.fileName}
                charts={chartConfigs}
                viewMode={viewMode}
              />
              <Button variant="outline" size="sm" onClick={onReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                New File
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <ViewModeDescription mode={viewMode} />
          </div>
        </div>
      </motion.header>

      {/* Sheet Tabs */}
      {data.sheets.length > 1 && (
        <div className="container mx-auto px-4 py-3">
          <Tabs value={String(activeSheet)} onValueChange={(v) => setActiveSheet(Number(v))}>
            <TabsList className="bg-muted/50">
              {data.sheets.map((s, i) => (
                <TabsTrigger key={i} value={String(i)} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {s.sheetName}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Main Tabs */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            {showQuality && (
              <TabsTrigger value="quality" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Data Quality
              </TabsTrigger>
            )}
            {showProfiling && (
              <TabsTrigger value="profiling" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Profiling
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Summary - Shows in Business & Executive modes */}
            {(viewMode === 'business' || viewMode === 'executive') && (
              <DashboardSummary
                sheet={sheet}
                qualityReport={qualityReport}
                dataProfile={dataProfile}
                onNavigateToQuality={() => setActiveTab('quality')}
                onNavigateToProfiling={() => setActiveTab('profiling')}
              />
            )}
            
            {/* Guided Insight for first-time users */}
            {showGuidedInsight && (
              <GuidedInsightMoment
                sheet={sheet}
                chartConfigs={chartConfigs}
                onDismiss={() => setShowGuidedInsight(false)}
              />
            )}

            {/* Data Assumptions Panel */}
            <DataAssumptionsPanel
              sheet={sheet}
              qualityReport={qualityReport}
              dataProfile={dataProfile}
              chartConfigs={chartConfigs}
            />

            {/* AI Insights Panel with Intentional Failure UX */}
            {isTimeout && !insightsLoading && (
              <IntentionalFailureUX 
                type="timeout" 
                onRetry={handleRefreshInsights}
                onDismiss={() => {}}
              />
            )}
            
            {!isTimeout && qualityReport.overallScore < 50 && !insightsLoading && insights.length > 0 && (
              <IntentionalFailureUX 
                type="low-quality" 
                onDismiss={() => {}}
                suggestions={[
                  `${qualityReport.summary.totalIssues} data issues detected`,
                  'Check the Data Quality tab for details',
                  'Consider cleaning data for better insights'
                ]}
              />
            )}
            
            {!isTimeout && !insightsLoading && insights.length > 0 && insights.every(i => i.confidence < 60) && (
              <IntentionalFailureUX 
                type="weak-insights" 
                onRetry={handleRefreshInsights}
                onDismiss={() => {}}
              />
            )}

            <AIInsightsPanel
              insights={insights}
              isLoading={insightsLoading}
              error={insightsError}
              isTimeout={isTimeout}
              onRefresh={handleRefreshInsights}
              onInsightClick={handleInsightClick}
            />

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard title="Total Rows" value={sheet.rowCount} subtitle="Data entries" icon={Rows3} color="primary" delay={0} />
              <StatCard title="Total Columns" value={sheet.columnCount} subtitle={`${numericColumns.length} numeric, ${categoryColumns.length} text`} icon={Columns3} color="secondary" delay={0.1} />
              {showDetailedStats && (
                <>
                  <StatCard title="Total Sum" value={totalSum.toLocaleString(undefined, { maximumFractionDigits: 0 })} subtitle="Across all numeric columns" icon={Hash} color="chart-3" delay={0.2} />
                  <StatCard title="Average Value" value={avgValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} subtitle="Mean of numeric columns" icon={ArrowUpDown} color="chart-5" delay={0.3} />
                </>
              )}
              {!showDetailedStats && (
                <>
                  <StatCard title="Quality Score" value={qualityReport.overallScore} subtitle="Data health" icon={Shield} color="chart-5" delay={0.2} />
                  <StatCard title="Issues Found" value={qualityReport.summary.totalIssues} subtitle={`${qualityReport.summary.criticalCount} critical`} icon={Sparkles} color="chart-4" delay={0.3} />
                </>
              )}
            </motion.div>

            {/* Charts with Draggable Grid */}
            {visibleCharts.length > 0 && (
              <section data-section="visualizations" className="relative">
                {/* Section Header with Gradient Background */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative mb-8 p-6 rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 72% 56% / 0.08) 0%, hsl(262 80% 65% / 0.08) 50%, hsl(196 80% 50% / 0.08) 100%)',
                  }}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-20" 
                    style={{ 
                      background: 'radial-gradient(circle, hsl(174 72% 56% / 0.4) 0%, transparent 70%)',
                      transform: 'translate(30%, -30%)'
                    }} 
                  />
                  <div className="absolute bottom-0 left-0 w-48 h-48 opacity-15"
                    style={{
                      background: 'radial-gradient(circle, hsl(262 80% 65% / 0.4) 0%, transparent 70%)',
                      transform: 'translate(-30%, 30%)'
                    }}
                  />
                  
                  <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold gradient-text">Data Visualizations</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {visibleCharts.length} chart{visibleCharts.length > 1 ? 's' : ''} • Interactive insights from your data
                        </p>
                      </div>
                    </div>
                    
                    {/* Layout Toggle with Enhanced Styling */}
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
                      <Button
                        variant={gridCols === 1 ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setGridCols(1)}
                        className={`h-9 px-4 gap-2 transition-all duration-300 ${gridCols === 1 ? 'shadow-md' : 'hover:bg-muted/50'}`}
                        title="Full width layout"
                      >
                        <Square className="w-4 h-4" />
                        <span className="text-sm font-medium">Full Width</span>
                      </Button>
                      <Button
                        variant={gridCols === 2 ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setGridCols(2)}
                        className={`h-9 px-4 gap-2 transition-all duration-300 ${gridCols === 2 ? 'shadow-md' : 'hover:bg-muted/50'}`}
                        title="Two column layout"
                      >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="text-sm font-medium">Grid View</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Charts Grid - Simple Static Layout */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative p-4 rounded-2xl bg-gradient-to-b from-muted/20 to-transparent border border-border/30"
                >
                  <div className={`grid gap-4 ${gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {visibleCharts.map((config, index) => (
                      <motion.div
                        key={config.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="min-h-[400px]"
                      >
                        <ConfigurableChart
                          columns={sheet.columns}
                          rows={sheet.rows}
                          initialConfig={config}
                          onConfigChange={(c) => handleConfigChange(index, c)}
                          delay={0}
                          colorIndex={index}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {/* Data Table */}
            {viewMode !== 'executive' && (
              <section className="pb-12">
                <h2 className="text-xl font-semibold text-foreground mb-4">Raw Data Preview</h2>
                <DataTable headers={sheet.headers} rows={sheet.rows} title={`${sheet.sheetName} - ${sheet.rowCount} rows`} />
              </section>
            )}
          </TabsContent>

          {showQuality && (
            <TabsContent value="quality">
              <Suspense fallback={<PanelSkeleton />}>
                <DataQualityPanel report={qualityReport} />
              </Suspense>
            </TabsContent>
          )}

          {showProfiling && (
            <TabsContent value="profiling">
              <Suspense fallback={<PanelSkeleton />}>
                <DataProfilingPanel profile={dataProfile} />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
