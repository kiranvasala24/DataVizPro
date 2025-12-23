import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ParsedData } from '@/lib/excel-parser';
import { DataQualityReport } from '@/lib/data-quality';
import { DataProfile } from '@/lib/data-profiling';
import { useToast } from '@/hooks/use-toast';

export interface AIInsight {
  text: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
  confidence: number;
  category: 'trend' | 'anomaly' | 'correlation' | 'quality' | 'pattern';
  relatedColumns: string[];
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | null;
  explanation?: string;
  dataPoints?: string[];
}

interface UseAIInsightsResult {
  insights: AIInsight[];
  isLoading: boolean;
  error: string | null;
  isTimeout: boolean;
  generateInsights: (sheet: ParsedData, qualityReport: DataQualityReport, dataProfile: DataProfile) => Promise<void>;
}

// Fallback insights when AI fails
function generateFallbackInsights(
  sheet: ParsedData, 
  qualityReport: DataQualityReport, 
  dataProfile: DataProfile
): AIInsight[] {
  const insights: AIInsight[] = [];
  const numericColumns = sheet.columns.filter(c => c.type === 'number');
  const categoricalColumns = sheet.columns.filter(c => c.type === 'string');

  // Basic dataset insight
  insights.push({
    text: `Dataset contains ${sheet.rowCount.toLocaleString()} rows across ${sheet.columnCount} columns`,
    severity: 'info',
    confidence: 100,
    category: 'pattern',
    relatedColumns: [],
    chartType: null,
    explanation: 'Basic dataset structure analysis',
    dataPoints: [`${numericColumns.length} numeric columns`, `${categoricalColumns.length} categorical columns`]
  });

  // Quality insight
  const qualitySeverity = qualityReport.overallScore >= 80 ? 'success' : qualityReport.overallScore >= 60 ? 'warning' : 'critical';
  insights.push({
    text: `Data quality score: ${qualityReport.overallScore}/100`,
    severity: qualitySeverity,
    confidence: 100,
    category: 'quality',
    relatedColumns: [],
    chartType: null,
    explanation: `${qualityReport.issues.length} data quality issues detected`,
    dataPoints: qualityReport.issues.slice(0, 3).map(i => i.message)
  });

  // High null percentage insight
  const highNullCols = dataProfile.columns.filter(c => c.nullPercentage > 20);
  if (highNullCols.length > 0) {
    insights.push({
      text: `${highNullCols.length} column(s) have >20% missing values`,
      severity: 'warning',
      confidence: 95,
      category: 'quality',
      relatedColumns: highNullCols.map(c => c.name),
      chartType: 'bar',
      explanation: 'Missing data may affect analysis accuracy',
      dataPoints: highNullCols.slice(0, 3).map(c => `${c.name}: ${c.nullPercentage.toFixed(1)}% null`)
    });
  }

  // Correlation insight
  const strongCorrelations = dataProfile.correlations.filter(c => c.strength === 'strong' || c.strength === 'very_strong');
  if (strongCorrelations.length > 0) {
    const top = strongCorrelations[0];
    insights.push({
      text: `Strong correlation found: ${top.column1} ↔ ${top.column2}`,
      severity: 'info',
      confidence: Math.abs(top.correlation) * 100,
      category: 'correlation',
      relatedColumns: [top.column1, top.column2],
      chartType: 'scatter',
      explanation: `Correlation coefficient: ${(top.correlation * 100).toFixed(0)}%`,
      dataPoints: strongCorrelations.slice(0, 3).map(c => `${c.column1} ↔ ${c.column2}: ${(c.correlation * 100).toFixed(0)}%`)
    });
  }

  // Skewed data insight
  const skewedCols = dataProfile.columns.filter(c => c.skewness === 'right' || c.skewness === 'left');
  if (skewedCols.length > 0) {
    insights.push({
      text: `${skewedCols.length} numeric column(s) show skewed distribution`,
      severity: 'info',
      confidence: 85,
      category: 'pattern',
      relatedColumns: skewedCols.map(c => c.name),
      chartType: 'bar',
      explanation: 'Skewed data may require transformation for certain analyses',
      dataPoints: skewedCols.slice(0, 3).map(c => `${c.name}: ${c.skewness}-skewed`)
    });
  }

  return insights;
}

const AI_TIMEOUT_MS = 30000; // 30 second timeout

export function useAIInsights(): UseAIInsightsResult {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateInsights = useCallback(async (
    sheet: ParsedData,
    qualityReport: DataQualityReport,
    dataProfile: DataProfile
  ) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);
    setIsTimeout(false);

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      setIsTimeout(true);
    }, AI_TIMEOUT_MS);

    try {
      const numericColumns = sheet.columns.filter(c => c.type === 'number');
      const categoricalColumns = sheet.columns.filter(c => c.type === 'string');

      const payload = {
        dataStats: {
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount,
          numericColumns: numericColumns.length,
          categoricalColumns: categoricalColumns.length,
        },
        qualityReport: {
          overallScore: qualityReport.overallScore,
          issues: qualityReport.issues.map(i => ({
            type: i.type,
            column: i.column,
            severity: i.severity,
            message: i.message,
            percentage: i.percentage,
          })),
        },
        profiling: {
          columns: dataProfile.columns.map(c => ({
            name: c.name,
            type: c.type,
            nullPercentage: c.nullPercentage,
            cardinality: c.cardinality,
            mean: c.mean,
            median: c.median,
            stdDev: c.stdDev,
            min: c.min,
            max: c.max,
            skewness: c.skewness,
          })),
          correlations: dataProfile.correlations.map(c => ({
            column1: c.column1,
            column2: c.column2,
            correlation: c.correlation,
            strength: c.strength,
          })),
        },
      };

      const { data, error: fnError } = await supabase.functions.invoke('generate-insights', {
        body: payload,
      });

      clearTimeout(timeoutId);

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add explainability data to insights
      const enrichedInsights = (data.insights || []).map((insight: AIInsight) => ({
        ...insight,
        explanation: insight.explanation || `Based on analysis of ${insight.relatedColumns.length > 0 ? insight.relatedColumns.join(', ') : 'dataset'}`,
        dataPoints: insight.dataPoints || [],
      }));

      setInsights(enrichedInsights);
      
      toast({
        title: "AI Insights Generated",
        description: `Found ${enrichedInsights.length} insights in your data`,
      });

    } catch (err) {
      clearTimeout(timeoutId);
      
      // Check if it was aborted (timeout or manual cancel)
      if (controller.signal.aborted) {
        console.log('AI insight generation was cancelled');
        // Use fallback insights on timeout
        const fallbackInsights = generateFallbackInsights(sheet, qualityReport, dataProfile);
        setInsights(fallbackInsights);
        
        toast({
          title: "Using Local Analysis",
          description: "AI timed out. Showing locally generated insights.",
          variant: "default",
        });
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      
      // Generate fallback insights on error
      const fallbackInsights = generateFallbackInsights(sheet, qualityReport, dataProfile);
      setInsights(fallbackInsights);
      
      toast({
        title: "Using Local Analysis",
        description: "AI unavailable. Showing locally generated insights.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { insights, isLoading, error, isTimeout, generateInsights };
}
