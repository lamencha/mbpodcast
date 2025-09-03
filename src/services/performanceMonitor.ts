// Runtime Performance Monitor Service
// BR2049 themed performance tracking with minimal overhead

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  componentMounts: number;
  interactionLatency: number;
  bundleLoadTime: number;
  errorCount: number;
  timestamp: number;
}

interface PerformanceConfig {
  enableFPSMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  enableInteractionTracking: boolean;
  reportingInterval: number;
  maxHistorySize: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private isMonitoring = false;
  
  // FPS monitoring
  private frameCount = 0;
  private lastFPSCheck = 0;
  private currentFPS = 60;
  private rafId: number = 0;
  
  // Component tracking
  private componentMountCount = 0;
  private renderStartTime = 0;
  
  // Interaction tracking
  private interactionStartTime = 0;
  private totalInteractions = 0;
  private totalLatency = 0;
  
  // Error tracking
  private errorCount = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableFPSMonitoring: true,
      enableMemoryMonitoring: true,
      enableInteractionTracking: true,
      reportingInterval: 5000,
      maxHistorySize: 100,
      ...config
    };
    
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;
    
    // Track bundle load time from navigation start
    const navigationStart = performance.timing?.navigationStart || 0;
    const bundleLoadTime = Date.now() - navigationStart;
    
    // Start monitoring
    this.startMonitoring();
    
    // Set up error tracking
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleError.bind(this));
    
    console.log('🔍 Performance Monitor initialized - Bundle load time:', bundleLoadTime + 'ms');
  }

  private startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    
    if (this.config.enableFPSMonitoring) {
      this.startFPSMonitoring();
    }
    
    // Periodic metrics collection
    setInterval(() => {
      if (this.isMonitoring) {
        this.collectMetrics();
      }
    }, this.config.reportingInterval);
  }

  private startFPSMonitoring() {
    const measureFPS = (timestamp: number) => {
      if (this.lastFPSCheck === 0) {
        this.lastFPSCheck = timestamp;
        this.frameCount = 0;
      } else {
        this.frameCount++;
        const elapsed = timestamp - this.lastFPSCheck;
        
        if (elapsed >= 1000) {
          this.currentFPS = Math.round((this.frameCount * 1000) / elapsed);
          this.frameCount = 0;
          this.lastFPSCheck = timestamp;
        }
      }
      
      if (this.isMonitoring) {
        this.rafId = requestAnimationFrame(measureFPS);
      }
    };
    
    this.rafId = requestAnimationFrame(measureFPS);
  }

  private collectMetrics() {
    const now = Date.now();
    const memoryInfo = (performance as any).memory;
    
    const metrics: PerformanceMetrics = {
      fps: this.currentFPS,
      memoryUsage: memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0,
      renderTime: this.getRenderTime(),
      componentMounts: this.componentMountCount,
      interactionLatency: this.getAverageInteractionLatency(),
      bundleLoadTime: performance.timing ? Date.now() - performance.timing.navigationStart : 0,
      errorCount: this.errorCount,
      timestamp: now
    };
    
    this.metrics.push(metrics);
    
    // Limit history size
    if (this.metrics.length > this.config.maxHistorySize) {
      this.metrics = this.metrics.slice(-this.config.maxHistorySize);
    }
    
    // Log performance warnings for development
    if (import.meta.env.DEV) {
      this.checkPerformanceThresholds(metrics);
    }
  }

  private getRenderTime(): number {
    if (!this.renderStartTime) return 0;
    return Date.now() - this.renderStartTime;
  }

  private getAverageInteractionLatency(): number {
    if (this.totalInteractions === 0) return 0;
    return Math.round(this.totalLatency / this.totalInteractions);
  }

  private handleError(event: ErrorEvent | PromiseRejectionEvent) {
    this.errorCount++;
    console.warn('⚠️ Performance Monitor - Error detected:', event);
  }

  private checkPerformanceThresholds(metrics: PerformanceMetrics) {
    const warnings: string[] = [];
    
    if (metrics.fps < 30) {
      warnings.push(`Low FPS: ${metrics.fps}`);
    }
    
    if (metrics.memoryUsage > 100) {
      warnings.push(`High memory usage: ${metrics.memoryUsage}MB`);
    }
    
    if (metrics.interactionLatency > 100) {
      warnings.push(`High interaction latency: ${metrics.interactionLatency}ms`);
    }
    
    if (warnings.length > 0) {
      console.warn('🚨 Performance Warnings:', warnings.join(', '));
    }
  }

  // Public API for React components
  public trackComponentMount() {
    this.componentMountCount++;
  }

  public trackRenderStart() {
    this.renderStartTime = Date.now();
  }

  public trackRenderEnd() {
    if (this.renderStartTime) {
      const renderTime = Date.now() - this.renderStartTime;
      this.renderStartTime = 0;
      return renderTime;
    }
    return 0;
  }

  public trackInteractionStart() {
    this.interactionStartTime = Date.now();
  }

  public trackInteractionEnd() {
    if (this.interactionStartTime) {
      const latency = Date.now() - this.interactionStartTime;
      this.totalLatency += latency;
      this.totalInteractions++;
      this.interactionStartTime = 0;
      return latency;
    }
    return 0;
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  public getPerformanceReport(): string {
    const latest = this.getCurrentMetrics();
    if (!latest) return 'No metrics available';
    
    return `
🎯 Performance Report:
├── FPS: ${latest.fps}
├── Memory: ${latest.memoryUsage}MB
├── Components: ${latest.componentMounts}
├── Avg Interaction: ${latest.interactionLatency}ms
├── Errors: ${latest.errorCount}
└── Uptime: ${Math.round((latest.timestamp - (this.metrics[0]?.timestamp || latest.timestamp)) / 1000)}s
    `.trim();
  }

  public stop() {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    console.log('🔍 Performance Monitor stopped');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default PerformanceMonitor;