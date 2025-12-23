import { useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings2, 
  ChevronDown,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  AreaChart,
  ScatterChart,
  Check,
  Download,
  Image,
  FileText,
  Loader2
} from 'lucide-react';
import { ColumnInfo, aggregateData } from '@/lib/excel-parser';
import { ChartConfig } from '@/lib/dashboard-storage';
import { formatChartTitle, formatColumnName } from '@/lib/format-utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChartComponent } from './charts/BarChartComponent';
import { LineChartComponent } from './charts/LineChartComponent';
import { PieChartComponent } from './charts/PieChartComponent';
import { AreaChartComponent } from './charts/AreaChartComponent';
import { ScatterChartComponent } from './charts/ScatterChartComponent';
import { ChartExplainer } from './ChartExplainer';
import { toast } from 'sonner';

interface ConfigurableChartProps {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  initialConfig: ChartConfig;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
  delay?: number;
  colorIndex?: number;
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
] as const;

const aggregations = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
] as const;

// Color schemes for visual differentiation
const COLOR_SCHEMES = [
  ['hsl(174, 72%, 56%)', 'hsl(174, 72%, 40%)', 'hsl(174, 72%, 70%)'],
  ['hsl(262, 80%, 65%)', 'hsl(262, 80%, 50%)', 'hsl(262, 80%, 75%)'],
  ['hsl(47, 95%, 55%)', 'hsl(47, 95%, 40%)', 'hsl(47, 95%, 70%)'],
  ['hsl(340, 75%, 55%)', 'hsl(340, 75%, 40%)', 'hsl(340, 75%, 70%)'],
  ['hsl(142, 70%, 45%)', 'hsl(142, 70%, 35%)', 'hsl(142, 70%, 60%)'],
  ['hsl(196, 80%, 50%)', 'hsl(196, 80%, 35%)', 'hsl(196, 80%, 65%)'],
];

export function ConfigurableChart({ 
  columns, 
  rows, 
  initialConfig, 
  onConfigChange,
  delay = 0,
  colorIndex = 0
}: ConfigurableChartProps) {
  const [config, setConfig] = useState<ChartConfig>(initialConfig);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [xAxisOpen, setXAxisOpen] = useState(false);
  const [yAxisOpen, setYAxisOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const xColumn = columns.find(c => c.name === config.xAxis);
  const yColumn = columns.find(c => c.name === config.yAxis);
  
  // Get color scheme based on index for visual differentiation
  const colors = COLOR_SCHEMES[colorIndex % COLOR_SCHEMES.length];

  const chartData = useMemo(() => {
    if (config.type === 'scatter') {
      return rows.slice(0, 100).map(row => ({
        x: Number(row[config.xAxis]) || 0,
        y: Number(row[config.yAxis]) || 0,
      }));
    }
    return aggregateData(rows, config.xAxis, config.yAxis, config.aggregation);
  }, [rows, config.xAxis, config.yAxis, config.aggregation, config.type]);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  // Format labels
  const displayTitle = formatChartTitle(config.yAxis, config.xAxis, config.type);
  const chartTypeInfo = chartTypes.find(t => t.value === config.type);
  const aggregationLabel = aggregations.find(a => a.value === config.aggregation)?.label || 'Sum';
  const xAxisLabel = formatColumnName(config.xAxis);
  const yAxisLabel = `${aggregationLabel} of ${formatColumnName(config.yAxis)}`;

  // Export chart as PNG
  const exportAsPNG = useCallback(async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${displayTitle.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Chart exported as PNG');
    } catch (error) {
      toast.error('Failed to export chart');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [displayTitle]);

  // Export chart as PDF
  const exportAsPDF = useCallback(async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${displayTitle.replace(/\s+/g, '_')}.pdf`);
      toast.success('Chart exported as PDF');
    } catch (error) {
      toast.error('Failed to export chart');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [displayTitle]);

  const renderChart = () => {
    const standardData = chartData as { name: string; value: number }[];
    const scatterData = chartData as { x: number; y: number }[];
    
    switch (config.type) {
      case 'bar':
        return <BarChartComponent data={standardData} title="" delay={delay} primaryColor={colors[0]} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />;
      case 'line':
        return <LineChartComponent data={standardData} title="" delay={delay} primaryColor={colors[0]} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />;
      case 'pie':
        return <PieChartComponent data={standardData} title="" delay={delay} colorIndex={colorIndex} />;
      case 'area':
        return <AreaChartComponent data={standardData} title="" delay={delay} primaryColor={colors[0]} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />;
      case 'scatter':
        return <ScatterChartComponent 
          data={scatterData} 
          title=""
          xLabel={xAxisLabel}
          yLabel={formatColumnName(config.yAxis)}
          delay={delay}
          primaryColor={colors[0]}
        />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
      }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: `0 8px 32px hsl(222 47% 3% / 0.6), 0 0 20px ${colors[0]}20`,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group h-full rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={{
        background: `linear-gradient(180deg, hsl(var(--card)) 0%, hsl(222 47% 7%) 100%)`,
        boxShadow: `0 4px 24px hsl(222 47% 3% / 0.5), inset 0 1px 0 hsl(var(--border) / 0.3)`,
        border: `1px solid hsl(var(--border) / 0.6)`,
      }}
    >
      {/* Top Accent Line with hover animation */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ 
          background: `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)` 
        }}
        animate={{ opacity: isHovered ? 1 : 0.8 }}
      />
      
      {/* Compact Header - Title + Export + Config */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate" style={{ color: colors[0] }}>
                {displayTitle}
              </h3>
              {/* Info icon next to title */}
              {xColumn && yColumn && (
                <ChartExplainer
                  chartType={config.type}
                  xColumn={xColumn}
                  yColumn={yColumn}
                  aggregation={config.aggregation}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="opacity-70">X:</span> {xAxisLabel} <span className="mx-1 opacity-40">•</span> 
              <span className="opacity-70">Y:</span> {yAxisLabel}
            </p>
          </div>
        </div>
        
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={exportAsPNG} className="cursor-pointer">
              <Image className="w-4 h-4 mr-2" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportAsPDF} className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Config Button */}
        <Popover open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">Configure Chart</h4>

              {/* Chart Type */}
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <div className="grid grid-cols-5 gap-1">
                  {chartTypes.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={config.type === value ? 'default' : 'outline'}
                      size="sm"
                      className="p-1.5 h-8"
                      onClick={() => updateConfig({ type: value })}
                      title={label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* X Axis */}
              <div className="space-y-1.5">
                <Label className="text-xs">X Axis (Dimension)</Label>
                <Popover open={xAxisOpen} onOpenChange={setXAxisOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between text-left font-normal h-8 text-xs">
                      {formatColumnName(config.xAxis)}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search..." className="h-8 text-xs" />
                      <CommandList>
                        <CommandEmpty>No column found.</CommandEmpty>
                        <CommandGroup>
                          {columns.map((col) => (
                            <CommandItem
                              key={col.name}
                              value={col.name}
                              onSelect={() => {
                                updateConfig({ xAxis: col.name });
                                setXAxisOpen(false);
                              }}
                              className="text-xs"
                            >
                              <Check className={`mr-2 h-3 w-3 ${config.xAxis === col.name ? 'opacity-100' : 'opacity-0'}`} />
                              <span className="truncate">{formatColumnName(col.name)}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground capitalize">{col.type}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Y Axis */}
              <div className="space-y-1.5">
                <Label className="text-xs">Y Axis (Metric)</Label>
                <Popover open={yAxisOpen} onOpenChange={setYAxisOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between text-left font-normal h-8 text-xs">
                      {formatColumnName(config.yAxis)}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search..." className="h-8 text-xs" />
                      <CommandList>
                        <CommandEmpty>No column found.</CommandEmpty>
                        <CommandGroup>
                          {columns.filter(c => c.type === 'number').map((col) => (
                            <CommandItem
                              key={col.name}
                              value={col.name}
                              onSelect={() => {
                                updateConfig({ yAxis: col.name });
                                setYAxisOpen(false);
                              }}
                              className="text-xs"
                            >
                              <Check className={`mr-2 h-3 w-3 ${config.yAxis === col.name ? 'opacity-100' : 'opacity-0'}`} />
                              <span className="truncate">{formatColumnName(col.name)}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Aggregation */}
              {config.type !== 'scatter' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Aggregation</Label>
                  <Select
                    value={config.aggregation}
                    onValueChange={(v) => updateConfig({ aggregation: v as typeof config.aggregation })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregations.map(({ value, label }) => (
                        <SelectItem key={value} value={value} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Chart Body - takes most space */}
      <div className="flex-1 px-4 py-3 relative" style={{ minHeight: 300 }}>
        {/* Subtle Background Glow */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${colors[0]}10 0%, transparent 60%)`
          }}
        />
        <div className="h-full w-full relative z-10" style={{ minHeight: 280 }}>
          {renderChart()}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="px-5 py-3 border-t border-border/20 flex items-center justify-between text-xs bg-muted/5">
        <div className="flex items-center gap-2">
          {chartTypeInfo && <chartTypeInfo.icon className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className="text-muted-foreground font-medium">{chartTypeInfo?.label}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-muted-foreground">{aggregationLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-semibold" style={{ color: colors[0] }}>{rows.length.toLocaleString()}</span>
          <span>data points</span>
        </div>
      </div>
    </motion.div>
  );
}
