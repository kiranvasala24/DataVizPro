import { motion } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  Crown,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'analyst' | 'business' | 'executive';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes = [
  {
    value: 'analyst' as ViewMode,
    label: 'Analyst',
    icon: User,
    description: 'Full data access, all metrics, detailed controls',
    color: 'primary',
  },
  {
    value: 'business' as ViewMode,
    label: 'Business',
    icon: Briefcase,
    description: 'Key KPIs, clean visualizations, summaries',
    color: 'secondary',
  },
  {
    value: 'executive' as ViewMode,
    label: 'Executive',
    icon: Crown,
    description: 'High-level insights, minimal charts',
    color: 'chart-3',
  },
];

export function ViewModeSelector({ currentMode, onModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/50 backdrop-blur-sm">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.value;
        
        return (
          <Button
            key={mode.value}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange(mode.value)}
            className={`relative flex items-center gap-2 transition-all ${
              isActive ? 'shadow-lg' : 'hover:bg-muted'
            }`}
            title={mode.description}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{mode.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 rounded-lg bg-primary -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </Button>
        );
      })}
    </div>
  );
}

export function ViewModeDescription({ mode }: { mode: ViewMode }) {
  const modeInfo = modes.find(m => m.value === mode);
  if (!modeInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Check className="w-4 h-4 text-primary" />
      <span>{modeInfo.description}</span>
    </motion.div>
  );
}
