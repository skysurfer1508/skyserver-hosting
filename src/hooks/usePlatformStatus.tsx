import { useState, useEffect, useCallback } from 'react';

export type PlatformStatus = 'online' | 'partial' | 'offline' | 'checking';

interface StatusResult {
  status: PlatformStatus;
  panelOnline: boolean;
  nodeOnline: boolean;
  lastChecked: Date | null;
}

const PANEL_URL = 'https://panel.skyserver1508.org';
const NODE_URL = 'https://node.skyserver1508.org';
const CHECK_INTERVAL = 60000; // 60 seconds

// Try to load favicon/image as CORS fallback
async function checkUrlViaImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, 10000); // 10 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      // For CORS-blocked resources, onerror fires but the server might still be up
      // We'll try a different approach
      resolve(false);
    };

    // Try loading the favicon
    img.src = `${url}/favicon.ico?_=${Date.now()}`;
  });
}

// Primary check using fetch with no-cors mode
async function checkUrl(url: string): Promise<boolean> {
  try {
    // First try with no-cors mode - this will succeed if server is reachable
    // even if CORS blocks the response reading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // In no-cors mode, we get an opaque response (type: 'opaque')
    // but if we got here without error, the server is reachable
    return true;
  } catch (error) {
    // Server is not reachable
    console.log(`Health check failed for ${url}:`, error);
    
    // Fallback: try image loading method
    return checkUrlViaImage(url);
  }
}

export function usePlatformStatus() {
  const [result, setResult] = useState<StatusResult>({
    status: 'checking',
    panelOnline: false,
    nodeOnline: false,
    lastChecked: null,
  });

  const checkStatus = useCallback(async () => {
    setResult(prev => ({ ...prev, status: 'checking' }));

    try {
      // Check both URLs in parallel
      const [panelOnline, nodeOnline] = await Promise.all([
        checkUrl(PANEL_URL),
        checkUrl(NODE_URL),
      ]);

      let status: PlatformStatus;
      if (panelOnline && nodeOnline) {
        status = 'online';
      } else if (panelOnline || nodeOnline) {
        status = 'partial';
      } else {
        status = 'offline';
      }

      setResult({
        status,
        panelOnline,
        nodeOnline,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error('Platform status check failed:', error);
      setResult({
        status: 'offline',
        panelOnline: false,
        nodeOnline: false,
        lastChecked: new Date(),
      });
    }
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkStatus();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkStatus, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkStatus]);

  return { ...result, refresh: checkStatus };
}
