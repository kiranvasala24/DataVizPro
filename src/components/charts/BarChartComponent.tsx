import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts';

interface BarChartComponentProps {
  data: { name: string; value: number }[];
  title: string;
  delay?: number;
  primaryColor?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const COLORS = [
  'hsl(174, 72%, 56%)',
  'hsl(262, 80%, 65%)',
  'hsl(47, 95%, 60%)',
  'hsl(340, 75%, 60%)',
  'hsl(142, 70%, 50%)',
  'hsl(196, 80%, 50%)',
];

export function BarChartComponent({ 
  data, 
  title, 
  delay = 0, 
  primaryColor = COLORS[0],
  xAxisLabel,
  yAxisLabel 
}: BarChartComponentProps) {
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
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
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
            cursor={{ fill: 'hsl(var(--primary) / 0.08)' }}
            formatter={(value: number) => [value.toLocaleString(), yAxisLabel || 'Value']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={primaryColor}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={primaryColor} opacity={0.7 + (index % 3) * 0.1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
