import { Dashboard } from '@/components/Dashboard';
import { FileUpload } from '@/components/FileUpload';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { ProductBoundaries } from '@/components/ProductBoundaries';
import { SampleDatasetPicker } from '@/components/SampleDatasetPicker';
import { UseCases } from '@/components/UseCases';
import { VersionBadge } from '@/components/VersionBadge';
import { ExcelFile } from '@/lib/excel-parser';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Shield, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
const Index = () => {
  const [excelData, setExcelData] = useState<ExcelFile | null>(null);

  const handleFileProcessed = (data: ExcelFile) => {
    setExcelData(data);
  };

  const handleReset = () => {
    setExcelData(null);
  };

  if (excelData) {
    return <Dashboard data={excelData} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-6"
        >
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BarChart3 className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/50" />
            </div>
            <span className="text-xl font-bold gradient-text">DataViz Pro</span>
            <VersionBadge variant="minimal" />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          </div>
        </nav>
      </motion.header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Data Visualization</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
            >
              Transform Excel into
              <br />
              <span className="gradient-text">Beautiful Dashboards</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Upload your spreadsheet and watch as AI automatically generates 
              stunning, interactive visualizations. No coding required.
            </motion.p>
          </div>

          {/* Upload Zone */}
          <div className="mt-16">
            <FileUpload onFileProcessed={handleFileProcessed} />
            <SampleDatasetPicker onSelect={handleFileProcessed} />
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="container mx-auto px-4">
          <UseCases />
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-8 group hover:border-primary/50 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Automatically detects data types, relationships, and suggests the best 
                visualizations for your data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-8 group hover:border-secondary/50 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-secondary/10 w-fit mb-4 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Multiple Chart Types</h3>
              <p className="text-muted-foreground text-sm">
                Bar charts, line graphs, pie charts, scatter plots, and more. 
                All beautifully styled and interactive.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card p-8 group hover:border-chart-5/50 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-chart-5/10 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-chart-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Privacy First</h3>
              <p className="text-muted-foreground text-sm">
                Your data never leaves your browser. All processing happens 
                locally for maximum security.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-foreground mb-12"
          >
            How it works
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Upload', desc: 'Drag and drop your Excel or CSV file' },
              { step: '02', title: 'Analyze', desc: 'AI detects patterns and data types' },
              { step: '03', title: 'Visualize', desc: 'Get beautiful, interactive charts instantly' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold gradient-text mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Product Boundaries Footer */}
        <ProductBoundaries variant="footer" />

        {/* Production Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-border/50">
          <div className="flex flex-col gap-6">
            {/* Main Footer Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">DataViz Pro</span>
                <VersionBadge variant="minimal" />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <PrivacyBadge variant="inline" />
                <span className="text-border">•</span>
                <span>Released Dec 2025</span>
              </div>
            </div>
            
            {/* Product Description & Links */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <p className="text-center md:text-left max-w-xl">
                Turns raw Excel and CSV files into explainable, shareable dashboards with built-in data quality checks and AI insights — entirely in the browser.
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
                <span className="text-border">•</span>
                <span>No signup required</span>
                <span className="text-border">•</span>
                <span>© 2025</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
