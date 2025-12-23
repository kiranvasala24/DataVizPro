import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  dataStats: {
    rowCount: number;
    columnCount: number;
    numericColumns: number;
    categoricalColumns: number;
  };
  qualityReport: {
    overallScore: number;
    issues: Array<{
      type: string;
      column?: string;
      severity: string;
      message: string;
      percentage: number;
    }>;
  };
  profiling: {
    columns: Array<{
      name: string;
      type: string;
      nullPercentage: number;
      cardinality: string;
      mean?: number;
      median?: number;
      stdDev?: number;
      min?: number;
      max?: number;
      skewness?: string;
    }>;
    correlations: Array<{
      column1: string;
      column2: string;
      correlation: number;
      strength: string;
    }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dataStats, qualityReport, profiling } = await req.json() as InsightRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a data analyst AI that generates concise, actionable insights from dataset analysis. 
Your insights should:
- Be specific and reference actual column names and values
- Highlight trends, anomalies, and correlations
- Identify potential business implications
- Avoid generic statements
- Be formatted as JSON array of insight objects

Each insight must have:
- "text": The insight description (max 100 chars)
- "severity": "info" | "warning" | "success" | "critical"
- "confidence": number 0-100
- "category": "trend" | "anomaly" | "correlation" | "quality" | "pattern"
- "relatedColumns": array of column names involved
- "chartType": suggested chart type if applicable ("bar" | "line" | "pie" | "scatter" | null)

Return ONLY a valid JSON array, no markdown or explanation.`;

    const userPrompt = `Analyze this dataset and generate 4-6 specific insights:

Dataset Overview:
- Rows: ${dataStats.rowCount}
- Columns: ${dataStats.columnCount} (${dataStats.numericColumns} numeric, ${dataStats.categoricalColumns} categorical)

Data Quality:
- Overall Score: ${qualityReport.overallScore}/100
- Issues: ${qualityReport.issues.map(i => `${i.severity}: ${i.message}`).join('; ')}

Column Profiles:
${profiling.columns.map(c => {
  let desc = `- ${c.name} (${c.type}): ${c.nullPercentage.toFixed(1)}% null, ${c.cardinality} cardinality`;
  if (c.type === 'number' && c.mean !== undefined) {
    desc += `, mean=${c.mean.toFixed(2)}, std=${c.stdDev?.toFixed(2)}, range=${c.min?.toFixed(2)}-${c.max?.toFixed(2)}`;
    if (c.skewness) desc += `, ${c.skewness} skewed`;
  }
  return desc;
}).join('\n')}

Correlations:
${profiling.correlations.filter(c => c.strength !== 'none' && c.strength !== 'weak').slice(0, 5).map(c => 
  `- ${c.column1} ↔ ${c.column2}: ${(c.correlation * 100).toFixed(0)}% (${c.strength})`
).join('\n') || 'No significant correlations found'}

Generate specific, actionable insights based on this analysis.`;

    console.log("Sending request to AI gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("Raw AI response:", content);

    // Parse the JSON response
    let insights;
    try {
      // Clean up the response in case it has markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      insights = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return fallback insights
      insights = [
        {
          text: `Dataset contains ${dataStats.rowCount} rows across ${dataStats.columnCount} columns`,
          severity: "info",
          confidence: 100,
          category: "pattern",
          relatedColumns: [],
          chartType: null
        },
        {
          text: `Data quality score: ${qualityReport.overallScore}/100 with ${qualityReport.issues.length} issues`,
          severity: qualityReport.overallScore >= 70 ? "success" : "warning",
          confidence: 100,
          category: "quality",
          relatedColumns: [],
          chartType: null
        }
      ];
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in generate-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
