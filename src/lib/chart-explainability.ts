import { ColumnInfo } from './excel-parser';

export interface ChartExplanation {
  chartType: string;
  whyChosen: string;
  transformations: string[];
  aggregation: string;
  dataRelationship: string;
  bestFor: string[];
  limitations: string[];
  alternativeCharts: string[];
}

export function explainChartChoice(
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter',
  xColumn: ColumnInfo,
  yColumn: ColumnInfo,
  aggregationType: string = 'sum'
): ChartExplanation {
  const explanations: Record<string, ChartExplanation> = {
    bar: {
      chartType: 'Bar Chart',
      whyChosen: `Bar charts excel at comparing ${yColumn.name} across different ${xColumn.name} categories. With ${xColumn.uniqueValues} unique categories, this is optimal for visual comparison.`,
      transformations: [
        `Grouped data by "${xColumn.name}"`,
        `Applied ${aggregationType.toUpperCase()} aggregation on "${yColumn.name}"`,
        'Sorted by value (descending)',
        'Limited to top 10 categories for readability'
      ],
      aggregation: `${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)} of ${yColumn.name} per ${xColumn.name}`,
      dataRelationship: `Categorical (${xColumn.name}) → Numeric (${yColumn.name})`,
      bestFor: [
        'Comparing values across categories',
        'Showing rankings or distributions',
        'Highlighting differences between groups'
      ],
      limitations: [
        'May become cluttered with many categories',
        'Not ideal for time-series data',
        'Difficult to show proportions'
      ],
      alternativeCharts: ['Horizontal Bar (if labels are long)', 'Treemap (for hierarchical data)', 'Lollipop Chart (for cleaner look)']
    },
    line: {
      chartType: 'Line Chart',
      whyChosen: `Line charts are ideal for showing trends over ${xColumn.type === 'date' ? 'time' : 'continuous values'}. The "${xColumn.name}" column provides a natural progression for tracking "${yColumn.name}".`,
      transformations: [
        `Ordered data by "${xColumn.name}"`,
        `Aggregated "${yColumn.name}" using ${aggregationType.toUpperCase()}`,
        'Connected data points with interpolated lines',
        'Applied smoothing for trend visibility'
      ],
      aggregation: `${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)} of ${yColumn.name} per ${xColumn.name}`,
      dataRelationship: `Sequential/Time (${xColumn.name}) → Numeric (${yColumn.name})`,
      bestFor: [
        'Showing trends over time',
        'Identifying patterns and seasonality',
        'Comparing multiple series'
      ],
      limitations: [
        'Can be misleading with irregular intervals',
        'May hide individual data points',
        'Confusing with too many lines'
      ],
      alternativeCharts: ['Area Chart (to emphasize volume)', 'Step Chart (for discrete changes)', 'Sparkline (for compact view)']
    },
    pie: {
      chartType: 'Pie Chart',
      whyChosen: `Pie charts show how "${yColumn.name}" is distributed across "${xColumn.name}" categories as parts of a whole. With ${xColumn.uniqueValues} categories, proportional relationships are clear.`,
      transformations: [
        `Calculated ${aggregationType.toUpperCase()} of "${yColumn.name}" per "${xColumn.name}"`,
        'Converted to percentages of total',
        'Limited to top categories for clarity',
        'Grouped small values into "Other"'
      ],
      aggregation: `Proportion of ${yColumn.name} by ${xColumn.name}`,
      dataRelationship: `Part-to-Whole (${xColumn.name} segments → ${yColumn.name} proportions)`,
      bestFor: [
        'Showing composition/market share',
        'Displaying proportions',
        'Simple part-to-whole relationships'
      ],
      limitations: [
        'Hard to compare similar-sized slices',
        'Ineffective with many categories',
        'Cannot show changes over time'
      ],
      alternativeCharts: ['Donut Chart (shows total in center)', 'Stacked Bar (better for comparison)', 'Treemap (for hierarchical data)']
    },
    area: {
      chartType: 'Area Chart',
      whyChosen: `Area charts emphasize the magnitude of "${yColumn.name}" over "${xColumn.name}", making cumulative totals and trends more visually impactful than line charts.`,
      transformations: [
        `Ordered by "${xColumn.name}"`,
        `Applied ${aggregationType.toUpperCase()} on "${yColumn.name}"`,
        'Filled area under the curve',
        'Applied gradient for depth perception'
      ],
      aggregation: `Cumulative ${aggregationType} of ${yColumn.name} over ${xColumn.name}`,
      dataRelationship: `Continuous (${xColumn.name}) → Volume (${yColumn.name})`,
      bestFor: [
        'Emphasizing volume over time',
        'Showing cumulative totals',
        'Comparing stacked categories'
      ],
      limitations: [
        'Lower values can be hidden',
        'Overlapping areas cause confusion',
        'Not for precise comparisons'
      ],
      alternativeCharts: ['Stacked Area (multiple series)', 'Stream Graph (proportional flow)', 'Line Chart (for precision)']
    },
    scatter: {
      chartType: 'Scatter Plot',
      whyChosen: `Scatter plots reveal the relationship between "${xColumn.name}" and "${yColumn.name}". With ${xColumn.uniqueValues}+ data points, patterns, clusters, and correlations become visible.`,
      transformations: [
        `Plotted "${xColumn.name}" on X-axis`,
        `Plotted "${yColumn.name}" on Y-axis`,
        'Limited to 100 points for performance',
        'No aggregation - showing raw relationships'
      ],
      aggregation: `No aggregation - direct ${xColumn.name} vs ${yColumn.name} comparison`,
      dataRelationship: `Correlation (${xColumn.name} ↔ ${yColumn.name})`,
      bestFor: [
        'Finding correlations',
        'Identifying clusters and outliers',
        'Exploring relationships between variables'
      ],
      limitations: [
        'Can be cluttered with many points',
        'Overlapping points hide density',
        'Requires numeric data only'
      ],
      alternativeCharts: ['Bubble Chart (add third variable)', 'Hexbin Plot (for density)', 'Contour Plot (for distribution)']
    }
  };

  return explanations[chartType] || explanations.bar;
}
