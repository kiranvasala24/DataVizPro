import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrivacyBadgeProps {
  variant?: 'inline' | 'floating';
}

export function PrivacyBadge({ variant = 'inline' }: PrivacyBadgeProps) {
  if (variant === 'floating') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-chart-5/10 border border-chart-5/30 backdrop-blur-sm cursor-help"
            >
              <Lock className="w-3.5 h-3.5 text-chart-5" />
              <span className="text-xs font-medium text-chart-5">Data stays local</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-chart-5" />
                <span className="font-semibold">Privacy First</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your data is processed entirely in your browser. No files are uploaded to any server. 
                Your spreadsheets never leave your device.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chart-5/10 border border-chart-5/20 cursor-help"
          >
            <Lock className="w-3 h-3 text-chart-5" />
            <span className="text-xs font-medium text-chart-5">100% Private</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-chart-5" />
              <span className="font-semibold">Your Data Never Leaves Your Browser</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All data processing happens locally on your device. Your spreadsheets are never 
              uploaded to any external servers, ensuring complete privacy and security.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
