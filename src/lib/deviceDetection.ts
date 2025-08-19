/**
 * Device detection utility for accurate device type identification
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  touchEnabled: boolean;
  platform: string;
}

/**
 * Detects the actual device type based on user agent, screen size, and capabilities
 */
export const detectDeviceType = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const platform = navigator.platform;

  // Check for tablet indicators first (most specific)
  const isTablet = () => {
    // iPad detection
    if (/iPad/.test(userAgent)) return true;
    
    // Android tablet detection
    if (/Android/.test(userAgent) && !/Mobile/.test(userAgent)) return true;
    
    // Large screen mobile devices (phablets/tablets)
    if (touchEnabled && (screenWidth >= 768 || screenHeight >= 768)) {
      // Additional Android tablet checks
      if (/Android/.test(userAgent)) return true;
      
      // Windows tablets
      if (/Windows/.test(userAgent) && /Touch/.test(userAgent)) return true;
      
      // Generic large touch screen devices
      if (screenWidth >= 1024 && screenHeight >= 768) return true;
    }
    
    return false;
  };

  // Check for mobile indicators
  const isMobile = () => {
    // Common mobile patterns
    if (/iPhone|iPod/.test(userAgent)) return true;
    if (/Android.*Mobile/.test(userAgent)) return true;
    if (/Mobile|Mobi/.test(userAgent)) return true;
    
    // Small screen with touch
    if (touchEnabled && screenWidth < 768 && screenHeight < 1024) return true;
    
    return false;
  };

  // Determine device type
  let deviceType: 'mobile' | 'tablet' | 'desktop';
  
  if (isTablet()) {
    deviceType = 'tablet';
  } else if (isMobile()) {
    deviceType = 'mobile';
  } else {
    deviceType = 'desktop';
  }

  return {
    type: deviceType,
    userAgent,
    screenWidth,
    screenHeight,
    touchEnabled,
    platform
  };
};

/**
 * Get a simple device type string for session tracking
 */
export const getDeviceTypeString = (): string => {
  return detectDeviceType().type;
};

/**
 * Get detailed device information for logging/debugging
 */
export const getDetailedDeviceInfo = (): DeviceInfo => {
  return detectDeviceType();
};