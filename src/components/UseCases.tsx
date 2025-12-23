import { motion } from 'framer-motion';
import { FileSearch, Shield, Presentation, ArrowRight, Sparkles } from 'lucide-react';

const useCases = [
  {
    icon: FileSearch,
    title: 'Explore CSVs Quickly',
    description: 'Upload any spreadsheet and get instant visualizations without configuration.',
    color: 'primary',
    gradient: 'from-primary/20 to-primary/5'
  },
  {
    icon: Shield,
    title: 'Validate Data Quality',
    description: 'Identify missing values, outliers, and data issues before modeling.',
    color: 'chart-5',
    gradient: 'from-chart-5/20 to-chart-5/5'
  },
  {
    icon: Presentation,
    title: 'Generate Executive Summaries',
    description: 'Create shareable insights and reports for stakeholders.',
    color: 'secondary',
    gradient: 'from-secondary/20 to-secondary/5'
  }
];

interface UseCasesProps {
  variant?: 'cards' | 'inline';
}

export function UseCases({ variant = 'cards' }: UseCasesProps) {
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap items-center justify-center gap-4 text-sm"
      >
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50"
            >
              <Icon className={`w-4 h-4 text-${useCase.color}`} />
              <span className="text-muted-foreground">{useCase.title}</span>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Use Cases</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Built for Real Workflows</h2>
        <p className="text-muted-foreground mt-2">
          Three ways to get value in under 30 seconds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className={`p-3 rounded-xl bg-${useCase.color}/10 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${useCase.color}`} />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {useCase.description}
                </p>
                
                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Try it now</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
