// Mobile Detection and Optimization Utilities
// Advanced device detection and mobile-specific optimizations

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasTouch: boolean;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  connectionType: string;
  isLowPowerMode: boolean;
  supportsHover: boolean;
}

export interface PerformanceSettings {
  enableVisualEffects: boolean;
  enableAnimations: boolean;
  particleCount: number;
  renderQuality: 'high' | 'medium' | 'low';
  maxFPS: number;
  enableBackgroundSync: boolean;
}

class MobileDetector {
  private static instance: MobileDetector;
  private deviceInfo: DeviceInfo | null = null;
  private performanceSettings: PerformanceSettings | null = null;
  
  static getInstance(): MobileDetector {
    if (!this.instance) {
      this.instance = new MobileDetector();
    }
    return this.instance;
  }

  // Comprehensive device detection
  getDeviceInfo(): DeviceInfo {
    if (this.deviceInfo) return this.deviceInfo;

    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    
    // Screen dimensions and pixel ratio
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Device type detection
    const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                     (hasTouch && Math.max(viewportWidth, viewportHeight) < 1024);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                     (hasTouch && Math.min(viewportWidth, viewportHeight) >= 768);
    const isDesktop = !isMobile && !isTablet;
    
    // Platform detection
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    
    // Orientation
    const orientation = viewportWidth > viewportHeight ? 'landscape' : 'portrait';
    
    // Connection type (if available)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection?.effectiveType || 'unknown';
    
    // Low power mode detection (experimental)
    const isLowPowerMode = this.detectLowPowerMode();

    this.deviceInfo = {
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      hasTouch,
      viewportWidth,
      viewportHeight,
      pixelRatio,
      orientation,
      connectionType,
      isLowPowerMode,
      supportsHover
    };

    return this.deviceInfo;
  }

  // Performance-based settings for different devices
  getOptimalPerformanceSettings(): PerformanceSettings {
    if (this.performanceSettings) return this.performanceSettings;

    const deviceInfo = this.getDeviceInfo();
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';
    const saveData = connection?.saveData || false;
    
    // Base settings for different device types
    let settings: PerformanceSettings;
    
    if (deviceInfo.isMobile) {
      // Mobile optimizations
      settings = {
        enableVisualEffects: !deviceInfo.isLowPowerMode && effectiveType !== '2g',
        enableAnimations: !saveData,
        particleCount: deviceInfo.isLowPowerMode ? 15 : 20, // Reduced from 28
        renderQuality: effectiveType === '2g' || deviceInfo.isLowPowerMode ? 'low' : 'medium',
        maxFPS: deviceInfo.isLowPowerMode ? 24 : 30,
        enableBackgroundSync: effectiveType !== '2g'
      };
    } else if (deviceInfo.isTablet) {
      // Tablet optimizations
      settings = {
        enableVisualEffects: true,
        enableAnimations: !saveData,
        particleCount: 24, // Slightly reduced from 28
        renderQuality: deviceInfo.isLowPowerMode ? 'medium' : 'high',
        maxFPS: deviceInfo.isLowPowerMode ? 30 : 45,
        enableBackgroundSync: true
      };
    } else {
      // Desktop - full performance
      settings = {
        enableVisualEffects: true,
        enableAnimations: true,
        particleCount: 28, // Full particle count
        renderQuality: 'high',
        maxFPS: 60,
        enableBackgroundSync: true
      };
    }

    this.performanceSettings = settings;
    return settings;
  }

  // Detect low power mode (iOS Safari and some Android browsers)
  private detectLowPowerMode(): boolean {
    try {
      // iOS Safari low power mode detection
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl');
      if (context) {
        const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          // Low power mode typically switches to software rendering
          return renderer.includes('Swift') || renderer.includes('llvmpipe');
        }
      }
      
      // Alternative: Check for reduced animation preference
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      return false;
    }
  }

  // Check if device needs mobile-specific optimizations
  needsMobileOptimizations(): boolean {
    const deviceInfo = this.getDeviceInfo();
    return deviceInfo.isMobile || deviceInfo.isTablet || deviceInfo.isLowPowerMode;
  }

  // Adaptive viewport handling for mobile
  setupViewportOptimizations(): void {
    if (!this.getDeviceInfo().isMobile) return;

    // Prevent zoom on input focus (iOS)
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && this.getDeviceInfo().isIOS) {
      const content = viewport.getAttribute('content') || '';
      if (!content.includes('user-scalable=no')) {
        viewport.setAttribute('content', content + ', user-scalable=no');
      }
    }

    // Handle viewport height changes (mobile browser UI)
    this.setupViewportHeightListener();
    
    // Setup orientation change optimization
    this.setupOrientationOptimization();
  }

  // Handle mobile browser UI showing/hiding
  private setupViewportHeightListener(): void {
    let lastHeight = window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = Math.abs(currentHeight - lastHeight);
      
      // Significant height change suggests mobile browser UI change
      if (heightDifference > 100) {
        document.documentElement.style.setProperty('--viewport-height', `${currentHeight}px`);
        
        // Dispatch custom event for components to react
        window.dispatchEvent(new CustomEvent('viewportchange', {
          detail: { height: currentHeight, difference: heightDifference }
        }));
      }
      
      lastHeight = currentHeight;
    };

    window.addEventListener('resize', handleViewportChange, { passive: true });
    
    // Initial setup
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  }

  // Optimize for orientation changes
  private setupOrientationOptimization(): void {
    const handleOrientationChange = () => {
      // Small delay to let the browser settle after orientation change
      setTimeout(() => {
        this.deviceInfo = null; // Reset cached device info
        this.performanceSettings = null; // Reset cached performance settings
        
        // Dispatch event for components to react
        window.dispatchEvent(new CustomEvent('orientationoptimize'));
      }, 150);
    };

    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    screen.orientation?.addEventListener('change', handleOrientationChange, { passive: true });
  }

  // Get touch-optimized event options
  getTouchEventOptions(passive: boolean = false): AddEventListenerOptions {
    return {
      passive,
      capture: false
    };
  }

  // Check if device benefits from reduced animations
  shouldReduceAnimations(): boolean {
    const deviceInfo = this.getDeviceInfo();
    const settings = this.getOptimalPerformanceSettings();
    
    return !settings.enableAnimations || 
           deviceInfo.isLowPowerMode || 
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Get optimal image sizes for device
  getOptimalImageSizes(): { thumbnail: number, medium: number, large: number } {
    const deviceInfo = this.getDeviceInfo();
    const pixelRatio = Math.min(deviceInfo.pixelRatio, 2); // Cap at 2x for performance
    
    if (deviceInfo.isMobile) {
      return {
        thumbnail: Math.round(64 * pixelRatio),
        medium: Math.round(256 * pixelRatio),
        large: Math.round(512 * pixelRatio)
      };
    } else {
      return {
        thumbnail: Math.round(96 * pixelRatio),
        medium: Math.round(384 * pixelRatio),
        large: Math.round(768 * pixelRatio)
      };
    }
  }

  // Log device info for debugging
  logDeviceInfo(): void {
    if (import.meta.env.DEV) {
      const info = this.getDeviceInfo();
      const settings = this.getOptimalPerformanceSettings();
      
      console.log('🔍 Mobile Detection Results:', {
        device: info,
        performanceSettings: settings,
        optimizationsNeeded: this.needsMobileOptimizations()
      });
    }
  }
}

// Export singleton instance
export const mobileDetector = MobileDetector.getInstance();
export default MobileDetector;