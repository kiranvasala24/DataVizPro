import { ReactNode, useCallback, useRef, useState, useEffect } from 'react';
import RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ChartConfig } from '@/lib/dashboard-storage';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

interface DraggableGridLayoutProps {
  charts: ChartConfig[];
  onLayoutChange: (charts: ChartConfig[]) => void;
  children: ReactNode[];
  cols?: number;
  rowHeight?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export function DraggableGridLayout({
  charts,
  onLayoutChange,
  children,
  cols = 1,
  rowHeight = 420,
  isDraggable = true,
  isResizable = true,
}: DraggableGridLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Recalculate layout when cols changes - each chart takes full width in 1-col mode
  const layout: LayoutItem[] = charts.map((chart, index) => {
    // When in 1-column mode, always use full width
    if (cols === 1) {
      return {
        i: chart.id,
        x: 0,
        y: index,
        w: 1,
        h: 1,
        minW: 1,
        minH: 1,
        maxW: 1,
        maxH: 2,
      };
    }
    // In 2-column mode, distribute across columns
    return {
      i: chart.id,
      x: index % cols,
      y: Math.floor(index / cols),
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
      maxW: cols,
      maxH: 2,
    };
  });

  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    const updatedCharts = charts.map(chart => {
      const layoutItem = newLayout.find(l => l.i === chart.id);
      if (layoutItem) {
        return {
          ...chart,
          layout: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          },
        };
      }
      return chart;
    });
    onLayoutChange(updatedCharts);
  }, [charts, onLayoutChange]);

  // Cast to any due to type definition issues in @types/react-grid-layout
  const GridLayout = RGL as any;

  return (
    <div ref={containerRef} className="relative w-full">
      <GridLayout
        className="layout"
        layout={layout}
        cols={cols}
        rowHeight={rowHeight}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable={isDraggable}
        isResizable={isResizable}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
      >
        {children.map((child, index) => (
          <div key={charts[index]?.id || `chart-${index}`} className="h-full w-full" style={{ minHeight: '100%' }}>
            {child}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}