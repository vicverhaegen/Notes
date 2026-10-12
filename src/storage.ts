import { AppData } from './types';
import { INITIAL_DATA } from './initialData';
import { supabase } from './supabase';

const STORAGE_KEY = 'notes_desktop_app_data';
const STATE_ROW_ID = 'primary_state';

// Track the latest local serialized string to avoid self-echoes from Realtime
let lastSavedLocalJson = '';
let cloudSaveTimeout: ReturnType<typeof setTimeout> | null = null;

// Check if running inside Electron window
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as unknown as { electronAPI?: unknown }).electronAPI);
};

export interface ElectronAPI {
  loadData: () => Promise<AppData | null>;
  saveData: (data: AppData) => Promise<{ success: boolean; error?: string }>;
  exportDataToFile: (data: AppData) => Promise<boolean>;
  importDataFromFile: () => Promise<AppData | null>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  pickImage: () => Promise<string | null>;
  sendNotification?: (title: string, body: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Helper to get local cached data
const getLocalData = async (): Promise<AppData | null> => {
  try {
    if (isElectron() && window.electronAPI?.loadData) {
      const data = await window.electronAPI.loadData();
      if (data && data.boards && data.boards.length > 0) {
        return data;
      }
    }

    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local) as AppData;
      if (parsed.boards && parsed.boards.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed reading local cache:', err);
  }
  return null;
};

// Helper to push to Supabase
const pushToCloud = async (data: AppData): Promise<void> => {
  try {
    const { error } = await supabase
      .from('app_state')
      .upsert({
        id: STATE_ROW_ID,
        data,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.warn('Supabase sync warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase sync network error:', err);
  }
};

export const loadAppData = async (): Promise<AppData> => {
  // 1. Try fetching from Supabase cloud
  try {
    const { data: row, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('id', STATE_ROW_ID)
      .maybeSingle();

    if (!error && row && row.data && (row.data as AppData).boards?.length > 0) {
      const cloudData = row.data as AppData;
      lastSavedLocalJson = JSON.stringify(cloudData);

      // Cache locally in background
      try {
        localStorage.setItem(STORAGE_KEY, lastSavedLocalJson);
        if (isElectron() && window.electronAPI?.saveData) {
          window.electronAPI.saveData(cloudData);
        }
      } catch (e) {
        console.warn('Failed caching cloud data locally:', e);
      }

      return cloudData;
    }
  } catch (err) {
    console.warn('Cloud load failed, falling back to local cache:', err);
  }

  // 2. Fallback to local cache (Electron file or localStorage)
  const localData = await getLocalData();
  if (localData) {
    lastSavedLocalJson = JSON.stringify(localData);
    // Asynchronously push local data to cloud so Supabase gets initialized
    pushToCloud(localData);
    return localData;
  }

  // 3. First time startup: use INITIAL_DATA
  lastSavedLocalJson = JSON.stringify(INITIAL_DATA);
  try {
    if (isElectron() && window.electronAPI?.saveData) {
      window.electronAPI.saveData(INITIAL_DATA);
    }
    localStorage.setItem(STORAGE_KEY, lastSavedLocalJson);
    pushToCloud(INITIAL_DATA);
  } catch (e) {
    console.error('Error seeding initial data:', e);
  }

  return INITIAL_DATA;
};

export const saveAppData = async (data: AppData, skipCloud = false): Promise<void> => {
  const jsonString = JSON.stringify(data);
  lastSavedLocalJson = jsonString;

  // 1. Local storage & Electron sync (instant, 0ms latency)
  try {
    localStorage.setItem(STORAGE_KEY, jsonString);
    if (isElectron() && window.electronAPI?.saveData) {
      await window.electronAPI.saveData(data);
    }
  } catch (err) {
    console.error('Failed saving local cache:', err);
  }

  // 2. Cloud sync (debounced 350ms to prevent spamming on rapid drag/slider moves)
  if (!skipCloud) {
    if (cloudSaveTimeout) {
      clearTimeout(cloudSaveTimeout);
    }
    cloudSaveTimeout = setTimeout(() => {
      pushToCloud(data);
    }, 350);
  }
};

// Subscribe to live Realtime updates from other devices (iPhone / Laptop)
export const subscribeToCloudUpdates = (
  onRemoteUpdate: (data: AppData) => void
): (() => void) => {
  let isFetching = false;

  const handleUpdate = async (incomingData?: AppData) => {
    let finalData = incomingData;

    // If data is missing (PostgreSQL skips large TOAST jsonb columns over websocket), fetch full state
    if (!finalData || !finalData.boards) {
      if (isFetching) return;
      isFetching = true;
      try {
        const { data: row } = await supabase
          .from('app_state')
          .select('data')
          .eq('id', STATE_ROW_ID)
          .maybeSingle();

        if (row && row.data && (row.data as AppData).boards?.length > 0) {
          finalData = row.data as AppData;
        }
      } catch (err) {
        console.warn('Failed fetching full cloud state:', err);
      } finally {
        isFetching = false;
      }
    }

    if (!finalData || !finalData.boards) return;

    const incomingJson = JSON.stringify(finalData);
    // Only trigger update if incoming data is genuinely different from local
    if (incomingJson !== lastSavedLocalJson) {
      lastSavedLocalJson = incomingJson;
      // Cache locally
      localStorage.setItem(STORAGE_KEY, incomingJson);
      if (isElectron() && window.electronAPI?.saveData) {
        window.electronAPI.saveData(finalData);
      }
      // Notify React component
      onRemoteUpdate(finalData);
    }
  };

  const channel = supabase
    .channel('realtime:app_state')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_state',
      },
      (payload) => {
        const newData = (payload.new as { data?: AppData })?.data;
        handleUpdate(newData);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
