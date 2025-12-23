import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

interface AreaChartComponentProps {
  data: { name: string; value: number }[];
  title: string;
  delay?: number;
  primaryColor?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function AreaChartComponent({ 
  data, 
  title, 
  delay = 0,
  primaryColor = 'hsl(174, 72%, 56%)',
  xAxisLabel,
  yAxisLabel
}: AreaChartComponentProps) {
  // Create gradient ID based on color to avoid conflicts
  const gradientId = `areaGradient-${primaryColor.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className="h-full w-full"
      style={{ minHeight: 280 }}
    >
      {title && <h3 className="text-sm font-medium text-foreground mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            angle={-35}
            textAnchor="end"
            height={50}
            interval={0}
          >
            {xAxisLabel && (
              <Label 
                value={xAxisLabel} 
                position="bottom" 
                offset={25}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
              />
            )}
          </XAxis>
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            width={50}
          >
            {yAxisLabel && (
              <Label 
                value={yAxisLabel} 
                angle={-90} 
                position="insideLeft" 
                offset={5}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500, textAnchor: 'middle' }}
              />
            )}
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            formatter={(value: number) => [value.toLocaleString(), yAxisLabel || 'Value']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={primaryColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
