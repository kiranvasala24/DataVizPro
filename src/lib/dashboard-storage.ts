export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  xAxis: string;
  yAxis: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  title: string;
  groupBy?: string;
  layout: { x: number; y: number; w: number; h: number };
}

export interface DashboardVersion {
  id: string;
  name: string;
  createdAt: Date;
  charts: ChartConfig[];
  viewMode: 'analyst' | 'business' | 'executive';
  notes?: string;
}

export interface SavedDashboard {
  id: string;
  fileName: string;
  currentVersion: string;
  versions: DashboardVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'dataviz_dashboards';

export function saveDashboard(dashboard: SavedDashboard): void {
  const dashboards = getAllDashboards();
  const existingIndex = dashboards.findIndex(d => d.id === dashboard.id);
  
  if (existingIndex >= 0) {
    dashboards[existingIndex] = { ...dashboard, updatedAt: new Date() };
  } else {
    dashboards.push(dashboard);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

export function getAllDashboards(): SavedDashboard[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((d: any) => ({
      ...d,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
      versions: d.versions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
      })),
    }));
  } catch {
    return [];
  }
}

export function getDashboard(id: string): SavedDashboard | null {
  const dashboards = getAllDashboards();
  return dashboards.find(d => d.id === id) || null;
}

export function deleteDashboard(id: string): void {
  const dashboards = getAllDashboards().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

export function createNewVersion(
  dashboardId: string,
  name: string,
  charts: ChartConfig[],
  viewMode: 'analyst' | 'business' | 'executive',
  notes?: string
): DashboardVersion {
  const version: DashboardVersion = {
    id: `v_${Date.now()}`,
    name,
    createdAt: new Date(),
    charts,
    viewMode,
    notes,
  };
  
  const dashboard = getDashboard(dashboardId);
  if (dashboard) {
    dashboard.versions.push(version);
    dashboard.currentVersion = version.id;
    saveDashboard(dashboard);
  }
  
  return version;
}

export function generateDashboardId(): string {
  return `dash_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
