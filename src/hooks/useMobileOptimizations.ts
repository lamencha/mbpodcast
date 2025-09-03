// Mobile Optimizations React Hook
// Provides mobile-specific performance and UX optimizations

import { useState, useEffect, useCallback } from 'react';
import { mobileDetector } from '../utils/mobileDetection';
import type { DeviceInfo, PerformanceSettings } from '../utils/mobileDetection';

interface MobileOptimizationState {
  deviceInfo: DeviceInfo;
  performanceSettings: PerformanceSettings;
  isViewportStable: boolean;
  touchEnabled: boolean;
  reducedMotion: boolean;
}

interface ViewportChangeEvent extends CustomEvent {
  detail: {
    height: number;
    difference: number;
  };
}

export function useMobileOptimizations() {
  const [state, setState] = useState<MobileOptimizationState>({
    deviceInfo: mobileDetector.getDeviceInfo(),
    performanceSettings: mobileDetector.getOptimalPerformanceSettings(),
    isViewportStable: true,
    touchEnabled: mobileDetector.getDeviceInfo().hasTouch,
    reducedMotion: mobileDetector.shouldReduceAnimations()
  });

  // Handle viewport changes (mobile browser UI)
  useEffect(() => {
    const handleViewportChange = (_event: ViewportChangeEvent) => {
      setState(prev => ({
        ...prev,
        isViewportStable: false
      }));

      // Mark viewport as stable after animation completes
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isViewportStable: true,
          deviceInfo: mobileDetector.getDeviceInfo() // Refresh device info
        }));
      }, 300);
    };

    window.addEventListener('viewportchange', handleViewportChange as EventListener);
    return () => window.removeEventListener('viewportchange', handleViewportChange as EventListener);
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationOptimize = () => {
      setState({
        deviceInfo: mobileDetector.getDeviceInfo(),
        performanceSettings: mobileDetector.getOptimalPerformanceSettings(),
        isViewportStable: false,
        touchEnabled: mobileDetector.getDeviceInfo().hasTouch,
        reducedMotion: mobileDetector.shouldReduceAnimations()
      });

      // Stabilize after orientation change
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isViewportStable: true
        }));
      }, 500);
    };

    window.addEventListener('orientationoptimize', handleOrientationOptimize);
    return () => window.removeEventListener('orientationoptimize', handleOrientationOptimize);
  }, []);

  // Setup viewport optimizations on mount
  useEffect(() => {
    mobileDetector.setupViewportOptimizations();
    mobileDetector.logDeviceInfo();
  }, []);

  // Optimized touch event handler factory
  const createTouchHandler = useCallback(<T extends Event>(
    handler: (event: T) => void,
    options: { passive?: boolean; preventDefault?: boolean } = {}
  ) => {
    return (event: T) => {
      if (options.preventDefault && !options.passive) {
        event.preventDefault();
      }
      
      // Add slight delay on touch devices to improve responsiveness perception
      if (state.touchEnabled && !options.passive) {
        requestAnimationFrame(() => handler(event));
      } else {
        handler(event);
      }
    };
  }, [state.touchEnabled]);

  // Get optimal touch event options
  const getTouchEventOptions = useCallback((passive: boolean = true) => {
    return mobileDetector.getTouchEventOptions(passive);
  }, []);

  // Check if component should render with mobile layout
  const shouldUseMobileLayout = useCallback(() => {
    return state.deviceInfo.isMobile || 
           (state.deviceInfo.isTablet && state.deviceInfo.orientation === 'portrait');
  }, [state.deviceInfo]);

  // Get optimal animation settings
  const getAnimationSettings = useCallback(() => {
    const { enableAnimations, maxFPS } = state.performanceSettings;
    
    return {
      enabled: enableAnimations && !state.reducedMotion,
      duration: state.reducedMotion ? 0 : (state.deviceInfo.isMobile ? 200 : 300),
      easing: state.deviceInfo.isMobile ? 'ease-out' : 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      targetFPS: maxFPS
    };
  }, [state.performanceSettings, state.reducedMotion, state.deviceInfo]);

  // Get optimal visual effects settings
  const getVisualEffectsSettings = useCallback(() => {
    const { enableVisualEffects, particleCount, renderQuality } = state.performanceSettings;
    
    return {
      enabled: enableVisualEffects,
      particleCount,
      quality: renderQuality,
      useGPUAcceleration: !state.deviceInfo.isLowPowerMode,
      enableBlur: !state.deviceInfo.isMobile || state.deviceInfo.pixelRatio <= 2
    };
  }, [state.performanceSettings, state.deviceInfo]);

  // Optimized scroll settings for mobile
  const getScrollSettings = useCallback(() => {
    return {
      momentum: state.deviceInfo.isIOS, // iOS has natural momentum scrolling
      overscrollBehavior: state.deviceInfo.isMobile ? 'none' : 'auto',
      touchAction: state.deviceInfo.hasTouch ? 'manipulation' : 'auto'
    };
  }, [state.deviceInfo]);

  // Get safe area insets
  const getSafeAreaInsets = useCallback(() => {
    if (!state.deviceInfo.isMobile && !state.deviceInfo.isTablet) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    return {
      top: 'env(safe-area-inset-top, 0px)',
      bottom: 'env(safe-area-inset-bottom, 0px)',
      left: 'env(safe-area-inset-left, 0px)',
      right: 'env(safe-area-inset-right, 0px)'
    };
  }, [state.deviceInfo]);

  // Check if device needs performance throttling
  const needsPerformanceThrottling = useCallback(() => {
    return state.deviceInfo.isLowPowerMode || 
           state.deviceInfo.connectionType === '2g' ||
           (state.deviceInfo.isMobile && state.deviceInfo.pixelRatio > 2);
  }, [state.deviceInfo]);

  // Get optimal image loading strategy
  const getImageLoadingStrategy = useCallback(() => {
    const connection = (navigator as any).connection;
    const saveData = connection?.saveData || false;
    const slowConnection = state.deviceInfo.connectionType === '2g' || 
                          state.deviceInfo.connectionType === 'slow-2g';

    return {
      lazy: true,
      sizes: mobileDetector.getOptimalImageSizes(),
      quality: saveData || slowConnection ? 'low' : 'auto',
      format: 'webp', // Modern format for better compression
      placeholder: 'blur'
    };
  }, [state.deviceInfo]);

  // Performance monitoring for mobile
  const trackMobilePerformance = useCallback((metric: string, value: number) => {
    if (import.meta.env.DEV && state.deviceInfo.isMobile) {
      console.log(`📱 Mobile Performance - ${metric}:`, value);
      
      // Warn about performance issues
      if (metric === 'fps' && value < 24) {
        console.warn('🚨 Low FPS detected on mobile device:', value);
      }
      
      if (metric === 'memory' && value > 50) {
        console.warn('🚨 High memory usage on mobile device:', value + 'MB');
      }
    }
  }, [state.deviceInfo]);

  return {
    // Device information
    deviceInfo: state.deviceInfo,
    performanceSettings: state.performanceSettings,
    isViewportStable: state.isViewportStable,
    touchEnabled: state.touchEnabled,
    reducedMotion: state.reducedMotion,
    
    // Layout helpers
    shouldUseMobileLayout,
    getSafeAreaInsets,
    needsPerformanceThrottling,
    
    // Event handling
    createTouchHandler,
    getTouchEventOptions,
    
    // Performance settings
    getAnimationSettings,
    getVisualEffectsSettings,
    getScrollSettings,
    getImageLoadingStrategy,
    
    // Performance monitoring
    trackMobilePerformance
  };
}

export default useMobileOptimizations;