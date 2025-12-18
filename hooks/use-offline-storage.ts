import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEYS = {
  SYMPTOM_LOGS: "offline_symptom_logs",
  SUPPLEMENT_LOGS: "offline_supplement_logs",
  BIOMARKERS: "offline_biomarkers",
  USER_PROFILE: "offline_user_profile",
  PENDING_SYNC: "pending_sync_queue",
  LAST_SYNC: "last_sync_timestamp",
} as const;

interface PendingSyncItem {
  id: string;
  type: "symptom" | "supplement" | "biomarker";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: number;
}

/**
 * Hook for managing offline data storage and sync queue
 */
export function useOfflineStorage<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, [key]);

  const loadData = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      }
      setError(null);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error loading from AsyncStorage:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveData = useCallback(async (newData: T) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
      setError(null);
    } catch (err) {
      setError("Failed to save data");
      console.error("Error saving to AsyncStorage:", err);
    }
  }, [key]);

  const clearData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setData(defaultValue);
      setError(null);
    } catch (err) {
      setError("Failed to clear data");
      console.error("Error clearing AsyncStorage:", err);
    }
  }, [key, defaultValue]);

  return { data, loading, error, saveData, clearData, reload: loadData };
}

/**
 * Hook for managing the sync queue for offline changes
 */
export function useSyncQueue() {
  const [pendingItems, setPendingItems] = useState<PendingSyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      if (stored) {
        setPendingItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading sync queue:", err);
    }
  };

  const addToQueue = useCallback(async (item: Omit<PendingSyncItem, "id" | "timestamp">) => {
    const newItem: PendingSyncItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const updatedQueue = [...pendingItems, newItem];
    setPendingItems(updatedQueue);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(updatedQueue));
    return newItem;
  }, [pendingItems]);

  const removeFromQueue = useCallback(async (itemId: string) => {
    const updatedQueue = pendingItems.filter((item) => item.id !== itemId);
    setPendingItems(updatedQueue);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(updatedQueue));
  }, [pendingItems]);

  const clearQueue = useCallback(async () => {
    setPendingItems([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  }, []);

  const syncItem = useCallback(async (
    item: PendingSyncItem,
    syncFn: (item: PendingSyncItem) => Promise<boolean>
  ) => {
    try {
      const success = await syncFn(item);
      if (success) {
        await removeFromQueue(item.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error syncing item:", err);
      return false;
    }
  }, [removeFromQueue]);

  const syncAll = useCallback(async (
    syncFn: (item: PendingSyncItem) => Promise<boolean>
  ) => {
    if (isSyncing || pendingItems.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;

    for (const item of pendingItems) {
      const success = await syncItem(item, syncFn);
      if (success) successCount++;
    }

    setIsSyncing(false);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

    return successCount;
  }, [isSyncing, pendingItems, syncItem]);

  return {
    pendingItems,
    pendingCount: pendingItems.length,
    isSyncing,
    addToQueue,
    removeFromQueue,
    clearQueue,
    syncAll,
  };
}

/**
 * Hook for caching symptom logs locally
 */
export function useSymptomCache() {
  const { data, loading, saveData, clearData } = useOfflineStorage<any[]>(
    STORAGE_KEYS.SYMPTOM_LOGS,
    []
  );
  const { addToQueue } = useSyncQueue();

  const addSymptomLog = useCallback(async (log: any) => {
    const newData = [...data, { ...log, id: `local-${Date.now()}`, isLocal: true }];
    await saveData(newData);
    await addToQueue({ type: "symptom", action: "create", data: log });
    return newData[newData.length - 1];
  }, [data, saveData, addToQueue]);

  const updateCache = useCallback(async (serverData: any[]) => {
    // Merge server data with local-only items
    const localOnly = data.filter((item) => item.isLocal);
    const merged = [...serverData, ...localOnly];
    await saveData(merged);
  }, [data, saveData]);

  return {
    cachedLogs: data,
    loading,
    addSymptomLog,
    updateCache,
    clearCache: clearData,
  };
}

/**
 * Hook for caching supplement logs locally
 */
export function useSupplementCache() {
  const { data, loading, saveData, clearData } = useOfflineStorage<any[]>(
    STORAGE_KEYS.SUPPLEMENT_LOGS,
    []
  );
  const { addToQueue } = useSyncQueue();

  const addSupplementLog = useCallback(async (log: any) => {
    const newData = [...data, { ...log, id: `local-${Date.now()}`, isLocal: true }];
    await saveData(newData);
    await addToQueue({ type: "supplement", action: "create", data: log });
    return newData[newData.length - 1];
  }, [data, saveData, addToQueue]);

  const updateCache = useCallback(async (serverData: any[]) => {
    const localOnly = data.filter((item) => item.isLocal);
    const merged = [...serverData, ...localOnly];
    await saveData(merged);
  }, [data, saveData]);

  return {
    cachedLogs: data,
    loading,
    addSupplementLog,
    updateCache,
    clearCache: clearData,
  };
}

/**
 * Hook for checking network connectivity
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // In React Native, we would use NetInfo
    // For now, assume online and check periodically
    const checkConnection = async () => {
      try {
        const response = await fetch("https://www.google.com", { method: "HEAD", mode: "no-cors" });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isOnline };
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(parseInt(timestamp, 10)) : null;
  } catch {
    return null;
  }
}
