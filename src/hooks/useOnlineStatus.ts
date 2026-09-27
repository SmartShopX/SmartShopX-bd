import { useEffect, useState, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { MarketplaceService } from '../services/marketplaceService';

export function useOnlineStatus(onSyncComplete?: (syncedCount: number, failedCount: number) => void) {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => {
    return StorageService.getPendingOfflineOrders().length;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [justSyncedToast, setJustSyncedToast] = useState<{ show: boolean; count: number }>({
    show: false,
    count: 0
  });

  const effectiveOnline = browserOnline && !simulatedOffline;

  // Refresh pending orders count
  const refreshPendingCount = useCallback(() => {
    setPendingSyncCount(StorageService.getPendingOfflineOrders().length);
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const result = await MarketplaceService.syncPendingOrdersToBackend();
      const remaining = StorageService.getPendingOfflineOrders().length;
      setPendingSyncCount(remaining);

      if (result.syncedCount > 0) {
        setJustSyncedToast({ show: true, count: result.syncedCount });
        setTimeout(() => {
          setJustSyncedToast({ show: false, count: 0 });
        }, 5000);
      }

      if (onSyncComplete) {
        onSyncComplete(result.syncedCount, result.failedCount);
      }
    } catch {
      // Fallback
      refreshPendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, onSyncComplete, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      // Auto-trigger sync on reconnect if not in simulated offline
      if (!simulatedOffline) {
        triggerSync();
      }
    };

    const handleOffline = () => {
      setBrowserOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [simulatedOffline, triggerSync]);

  const toggleSimulatedOffline = () => {
    const willBeOffline = !simulatedOffline;
    setSimulatedOffline(willBeOffline);

    if (!willBeOffline && browserOnline) {
      // Switching back to online in simulator -> sync orders!
      triggerSync();
    }
  };

  return {
    isOnline: effectiveOnline,
    browserOnline,
    simulatedOffline,
    toggleSimulatedOffline,
    pendingSyncCount,
    isSyncing,
    refreshPendingCount,
    triggerSync,
    justSyncedToast,
    dismissSyncedToast: () => setJustSyncedToast({ show: false, count: 0 })
  };
}
