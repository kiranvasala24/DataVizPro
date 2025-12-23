import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  History, 
  Plus, 
  Trash2, 
  ChevronRight,
  Clock,
  FileText,
  Check,
  X
} from 'lucide-react';
import { 
  DashboardVersion, 
  SavedDashboard, 
  saveDashboard as storageSave,
  getAllDashboards,
  deleteDashboard as storageDelete,
  generateDashboardId,
  ChartConfig
} from '@/lib/dashboard-storage';
import { ViewMode } from './ViewModeSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardVersioningProps {
  fileName: string;
  charts: ChartConfig[];
  viewMode: ViewMode;
  onLoadVersion?: (version: DashboardVersion) => void;
}

export function DashboardVersioning({ 
  fileName, 
  charts, 
  viewMode,
  onLoadVersion 
}: DashboardVersioningProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>(() => getAllDashboards());

  const currentDashboard = savedDashboards.find(d => d.fileName === fileName);

  const handleSave = () => {
    const name = versionName.trim() || `Version ${(currentDashboard?.versions.length || 0) + 1}`;
    
    const version: DashboardVersion = {
      id: `v_${Date.now()}`,
      name,
      createdAt: new Date(),
      charts,
      viewMode,
      notes: versionNotes.trim() || undefined,
    };

    if (currentDashboard) {
      currentDashboard.versions.push(version);
      currentDashboard.currentVersion = version.id;
      currentDashboard.updatedAt = new Date();
      storageSave(currentDashboard);
    } else {
      const newDashboard: SavedDashboard = {
        id: generateDashboardId(),
        fileName,
        currentVersion: version.id,
        versions: [version],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storageSave(newDashboard);
    }

    setSavedDashboards(getAllDashboards());
    setVersionName('');
    setVersionNotes('');
    setIsSaveOpen(false);
  };

  const handleLoadVersion = (version: DashboardVersion) => {
    onLoadVersion?.(version);
    setIsHistoryOpen(false);
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!currentDashboard) return;
    
    currentDashboard.versions = currentDashboard.versions.filter(v => v.id !== versionId);
    if (currentDashboard.versions.length === 0) {
      storageDelete(currentDashboard.id);
    } else {
      if (currentDashboard.currentVersion === versionId) {
        currentDashboard.currentVersion = currentDashboard.versions[currentDashboard.versions.length - 1].id;
      }
      storageSave(currentDashboard);
    }
    setSavedDashboards(getAllDashboards());
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save Version */}
      <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Version
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Dashboard Version</DialogTitle>
            <DialogDescription>
              Save the current state of your dashboard for later comparison or rollback.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Version Name</label>
              <Input
                placeholder={`Version ${(currentDashboard?.versions.length || 0) + 1}`}
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="What changes did you make?"
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p>This will save:</p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  {charts.length} chart configuration{charts.length !== 1 ? 's' : ''}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  View mode: {viewMode}
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <History className="w-4 h-4 mr-2" />
            History
            {currentDashboard && currentDashboard.versions.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {currentDashboard.versions.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
            <SheetDescription>
              View and restore previous dashboard configurations
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] mt-6">
            {currentDashboard && currentDashboard.versions.length > 0 ? (
              <div className="space-y-3 pr-4">
                {[...currentDashboard.versions].reverse().map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-colors ${
                      currentDashboard.currentVersion === version.id
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <h4 className="font-medium text-foreground">{version.name}</h4>
                          {currentDashboard.currentVersion === version.id && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(version.createdAt).toLocaleString()}
                        </div>
                        {version.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{version.notes}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {version.charts.length} charts
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {version.viewMode} mode
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {currentDashboard.currentVersion !== version.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadVersion(version)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVersion(version.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Saved Versions</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  Save your first version to start tracking changes to your dashboard.
                </p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
