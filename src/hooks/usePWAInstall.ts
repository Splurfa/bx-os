import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Utility functions for device detection
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isIOSSafari = () => {
  const ua = navigator.userAgent;
  return isIOS() && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
};

const isInStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    userAgent: '',
    isIOS: false,
    isIOSSafari: false,
    isStandalone: false,
    supportsInstallPrompt: false,
    promptEventFired: false
  });

  useEffect(() => {
    console.log('🔧 PWA Install Hook: Initializing...');
    
    // Set debug info
    const debug = {
      userAgent: navigator.userAgent,
      isIOS: isIOS(),
      isIOSSafari: isIOSSafari(),
      isStandalone: isInStandaloneMode(),
      supportsInstallPrompt: 'onbeforeinstallprompt' in window,
      promptEventFired: false
    };
    
    setDebugInfo(debug);
    console.log('🔧 PWA Debug Info:', debug);
    
    // Check if app is already installed (running in standalone mode)
    const installed = isInStandaloneMode();
    setIsInstalled(installed);
    console.log('🔧 PWA Install Status - Installed:', installed);

    // For iOS Safari, show install option even without beforeinstallprompt
    if (isIOSSafari() && !installed) {
      setIsInstallable(true);
      console.log('🔧 PWA: iOS Safari detected, enabling install option');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🔧 PWA: beforeinstallprompt event fired!', e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setDebugInfo(prev => ({ ...prev, promptEventFired: true }));
    };

    const handleAppInstalled = () => {
      console.log('🔧 PWA: App installed event fired!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Additional debug: Check PWA criteria
    if ('serviceWorker' in navigator) {
      console.log('🔧 PWA: Service Worker supported');
    } else {
      console.log('❌ PWA: Service Worker NOT supported');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    console.log('🔧 PWA: Install app triggered');
    
    // Handle iOS Safari installation
    if (isIOSSafari() && !deferredPrompt) {
      console.log('🔧 PWA: iOS Safari install - showing instructions');
      return 'ios-instructions';
    }
    
    if (!deferredPrompt) {
      console.log('❌ PWA: No deferred prompt available');
      return false;
    }

    try {
      console.log('🔧 PWA: Showing install prompt...');
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('🔧 PWA: User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('❌ PWA: Error installing:', error);
      return false;
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    installApp,
    debugInfo,
    isIOSSafari: isIOSSafari()
  };
};