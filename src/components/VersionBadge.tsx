import { motion } from 'framer-motion';
import { Info, Calendar, GitBranch } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Version metadata - update this when releasing
const VERSION_INFO = {
  version: '1.0.0',
  releaseDate: '2025-01-01',
  codename: 'Launch Edition',
  changes: [
    'AI-powered data insights with Gemini 2.5',
    'Multi-view dashboard (Analyst, Business, Executive)',
    'Data quality scoring and profiling',
    'Export to PDF/JSON with shareable summaries',
    'Sample datasets for instant exploration',
    'Privacy-first local processing'
  ]
};

interface VersionBadgeProps {
  variant?: 'minimal' | 'full';
}

export function VersionBadge({ variant = 'minimal' }: VersionBadgeProps) {
  const formattedDate = new Date(VERSION_INFO.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs text-muted-foreground cursor-help"
            >
              <GitBranch className="w-3 h-3" />
              <span>v{VERSION_INFO.version}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{VERSION_INFO.codename} • Released {formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted/80 border border-border/50 text-xs text-muted-foreground transition-colors cursor-pointer"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span className="font-medium">v{VERSION_INFO.version}</span>
          <span className="text-border">•</span>
          <span>{VERSION_INFO.codename}</span>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">DataViz Pro</h4>
              <p className="text-xs text-muted-foreground">{VERSION_INFO.codename}</p>
            </div>
            <div className="px-2 py-1 rounded bg-primary/10 text-primary text-sm font-mono">
              v{VERSION_INFO.version}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Released {formattedDate}</span>
          </div>
          
          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              What's included:
            </p>
            <ul className="space-y-1.5">
              {VERSION_INFO.changes.map((change, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
