import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Lightbulb, 
  TrendingDown, 
  Clock, 
  RefreshCw,
  ArrowRight,
  Sparkles,
  FileWarning,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntentionalFailureUXProps {
  type: 'timeout' | 'weak-insights' | 'low-quality' | 'no-correlations' | 'empty-data';
  onRetry?: () => void;
  onDismiss?: () => void;
  suggestions?: string[];
}

const failureConfigs = {
  timeout: {
    icon: Clock,
    title: 'AI Analysis Took Too Long',
    description: 'We switched to local analysis to keep things fast. Your insights are still valuable!',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    suggestions: [
      'Try with a smaller dataset for faster AI analysis',
      'Local insights are based on statistical patterns',
      'Refresh to try AI analysis again'
    ]
  },
  'weak-insights': {
    icon: Lightbulb,
    title: 'Limited Insights Found',
    description: 'Your data doesn\'t show strong patterns. This is actually useful information!',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    suggestions: [
      'Data may be too uniform or random for pattern detection',
      'Try adding more data points or time periods',
      'Consider different column combinations for analysis'
    ]
  },
  'low-quality': {
    icon: FileWarning,
    title: 'Data Quality Needs Attention',
    description: 'We found issues that may affect your analysis. Here\'s what you can do:',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    suggestions: [
      'Fill missing values or mark them consistently',
      'Check for duplicate rows that may skew results',
      'Standardize date and number formats'
    ]
  },
  'no-correlations': {
    icon: TrendingDown,
    title: 'No Strong Correlations Detected',
    description: 'Your variables appear independent. This finding can be just as valuable as finding correlations.',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    suggestions: [
      'Independence between variables is a valid finding',
      'Try analyzing different column pairs',
      'Consider if this matches your domain expectations'
    ]
  },
  'empty-data': {
    icon: AlertTriangle,
    title: 'Insufficient Data for Analysis',
    description: 'The dataset needs more rows to generate meaningful insights.',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    suggestions: [
      'Add more data rows (minimum 10 recommended)',
      'Check if your file uploaded completely',
      'Try a different sheet if available'
    ]
  }
};

export function IntentionalFailureUX({ 
  type, 
  onRetry, 
  onDismiss,
  suggestions: customSuggestions 
}: IntentionalFailureUXProps) {
  const config = failureConfigs[type];
  const Icon = config.icon;
  const displaySuggestions = customSuggestions || config.suggestions;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-5`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold ${config.color} mb-1`}>{config.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
            
            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                What you can do:
              </p>
              <ul className="space-y-1.5">
                {displaySuggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 opacity-50" />
                    {suggestion}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="h-8"
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDismiss}
                  className="h-8 text-muted-foreground"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1.5" />
                  Got it
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Quick helper component for inline failure messages
interface FailureHintProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
}

export function FailureHint({ message, type = 'info' }: FailureHintProps) {
  const styles = {
    info: 'text-blue-400 bg-blue-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    error: 'text-red-400 bg-red-500/10'
  };

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-xs px-2 py-1 rounded ${styles[type]} inline-flex items-center gap-1.5`}
    >
      <Lightbulb className="w-3 h-3" />
      {message}
    </motion.p>
  );
}
