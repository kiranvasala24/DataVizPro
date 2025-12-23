import { motion } from 'framer-motion';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Label } from 'recharts';

interface ScatterChartComponentProps {
  data: { x: number; y: number; name?: string }[];
  title: string;
  xLabel?: string;
  yLabel?: string;
  delay?: number;
  primaryColor?: string;
}

export function ScatterChartComponent({ 
  data, 
  title, 
  xLabel, 
  yLabel, 
  delay = 0,
  primaryColor = 'hsl(174, 72%, 56%)'
}: ScatterChartComponentProps) {
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
        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis 
            type="number"
            dataKey="x"
            name={xLabel}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          >
            {xLabel && (
              <Label 
                value={xLabel} 
                position="bottom" 
                offset={15}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
              />
            )}
          </XAxis>
          <YAxis 
            type="number"
            dataKey="y"
            name={yLabel}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            width={50}
          >
            {yLabel && (
              <Label 
                value={yLabel} 
                angle={-90} 
                position="insideLeft" 
                offset={5}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500, textAnchor: 'middle' }}
              />
            )}
          </YAxis>
          <ZAxis range={[50, 150]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            cursor={{ strokeDasharray: '3 3', stroke: primaryColor }}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
          <Scatter 
            data={data} 
            fill={primaryColor}
            opacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
