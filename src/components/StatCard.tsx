import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'chart-3' | 'chart-4' | 'chart-5';
  delay?: number;
}

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  'chart-3': 'text-chart-3',
  'chart-4': 'text-chart-4',
  'chart-5': 'text-chart-5',
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card group hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-3xl font-bold text-foreground mt-2"
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-muted/50 ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
