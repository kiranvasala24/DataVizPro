import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartComponentProps {
  data: { name: string; value: number }[];
  title: string;
  delay?: number;
  colorIndex?: number;
}

const COLOR_SETS = [
  ['hsl(174, 72%, 56%)', 'hsl(174, 72%, 45%)', 'hsl(174, 72%, 65%)', 'hsl(174, 50%, 40%)', 'hsl(174, 60%, 55%)'],
  ['hsl(262, 80%, 65%)', 'hsl(262, 80%, 50%)', 'hsl(262, 80%, 75%)', 'hsl(262, 60%, 55%)', 'hsl(262, 70%, 60%)'],
  ['hsl(47, 95%, 55%)', 'hsl(47, 95%, 45%)', 'hsl(47, 95%, 65%)', 'hsl(47, 80%, 50%)', 'hsl(47, 90%, 60%)'],
  ['hsl(340, 75%, 55%)', 'hsl(340, 75%, 45%)', 'hsl(340, 75%, 65%)', 'hsl(340, 60%, 50%)', 'hsl(340, 70%, 60%)'],
  ['hsl(142, 70%, 45%)', 'hsl(142, 70%, 35%)', 'hsl(142, 70%, 55%)', 'hsl(142, 55%, 40%)', 'hsl(142, 65%, 50%)'],
  ['hsl(196, 80%, 50%)', 'hsl(196, 80%, 40%)', 'hsl(196, 80%, 60%)', 'hsl(196, 65%, 45%)', 'hsl(196, 75%, 55%)'],
];

export function PieChartComponent({ data, title, delay = 0, colorIndex = 0 }: PieChartComponentProps) {
  const colors = COLOR_SETS[colorIndex % COLOR_SETS.length];
  
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="35%"
            outerRadius="65%"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
