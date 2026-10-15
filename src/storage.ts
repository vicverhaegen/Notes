import { AppData } from './types';
import { INITIAL_DATA } from './initialData';
import { supabase } from './supabase';

const STORAGE_KEY = 'notes_desktop_app_data';
const STATE_ROW_ID = 'primary_state';

// Unique client ID per window/session so this client never echoes its own updates back into local state
const CLIENT_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

// Track in-memory local state and timestamp to avoid race conditions and stale overwrites
let latestLocalData: AppData | null = null;
let lastLocalEditTimestamp = 0;
let cloudSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let isPushingToCloud = false;
let queuedDataForPush: AppData | null = null;

// Canonical stringify that normalizes object key order and excludes internal metadata fields
export const canonicalStringify = (obj: unknown): string => {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((k) => !k.startsWith('_'))
    .sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + canonicalStringify(record[k]))
      .join(',') +
    '}'
  );
};

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

// Push to Supabase with client identifier and timestamp
const pushToCloud = async (data: AppData): Promise<void> => {
  try {
    const payload = {
      ...data,
      _clientId: CLIENT_ID,
      _updatedAt: lastLocalEditTimestamp,
    };

    const { error } = await supabase
      .from('app_state')
      .upsert({
        id: STATE_ROW_ID,
        data: payload,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase sync warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase sync network error:', err);
  }
};

// Queue pushes so they never collide or get executed out-of-order
const triggerPushToCloud = async (data: AppData): Promise<void> => {
  if (isPushingToCloud) {
    queuedDataForPush = data;
    return;
  }
  isPushingToCloud = true;
  queuedDataForPush = null;

  try {
    await pushToCloud(data);
  } finally {
    isPushingToCloud = false;
    if (queuedDataForPush) {
      const nextData = queuedDataForPush;
      queuedDataForPush = null;
      triggerPushToCloud(nextData);
    }
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
      const cleanData: AppData = {
        boards: cloudData.boards,
        activeBoardId: cloudData.activeBoardId,
      };

      latestLocalData = cleanData;
      lastLocalEditTimestamp = cloudData._updatedAt || Date.now();

      // Cache locally in background
      try {
        const json = JSON.stringify(cleanData);
        localStorage.setItem(STORAGE_KEY, json);
        if (isElectron() && window.electronAPI?.saveData) {
          window.electronAPI.saveData(cleanData);
        }
      } catch (e) {
        console.warn('Failed caching cloud data locally:', e);
      }

      return cleanData;
    }
  } catch (err) {
    console.warn('Cloud load failed, falling back to local cache:', err);
  }

  // 2. Fallback to local cache (Electron file or localStorage)
  const localData = await getLocalData();
  if (localData) {
    const cleanData: AppData = {
      boards: localData.boards,
      activeBoardId: localData.activeBoardId,
    };
    latestLocalData = cleanData;
    lastLocalEditTimestamp = Date.now();
    // Asynchronously push local data to cloud so Supabase gets initialized
    triggerPushToCloud(cleanData);
    return cleanData;
  }

  // 3. First time startup: use INITIAL_DATA
  latestLocalData = INITIAL_DATA;
  lastLocalEditTimestamp = Date.now();
  try {
    if (isElectron() && window.electronAPI?.saveData) {
      window.electronAPI.saveData(INITIAL_DATA);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    triggerPushToCloud(INITIAL_DATA);
  } catch (e) {
    console.error('Error seeding initial data:', e);
  }

  return INITIAL_DATA;
};

export const saveAppData = async (data: AppData, skipCloud = false): Promise<void> => {
  // Update in-memory state tracking immediately
  latestLocalData = data;
  lastLocalEditTimestamp = Date.now();

  const jsonString = JSON.stringify(data);

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
      cloudSaveTimeout = null;
      triggerPushToCloud(data);
    }, 350);
  }
};

// Subscribe to live Realtime updates from other devices (iPhone / Laptop)
export const subscribeToCloudUpdates = (
  onRemoteUpdate: (data: AppData) => void
): (() => void) => {
  let isFetching = false;
  let hasPendingFetch = false;

  const handleUpdate = async () => {
    if (isFetching) {
      hasPendingFetch = true;
      return;
    }
    isFetching = true;

    try {
      const { data: row, error } = await supabase
        .from('app_state')
        .select('data')
        .eq('id', STATE_ROW_ID)
        .maybeSingle();

      if (error || !row || !row.data) return;

      const remoteRaw = row.data as AppData & {
        _clientId?: string;
        _updatedAt?: number;
      };

      if (!remoteRaw.boards || !Array.isArray(remoteRaw.boards) || remoteRaw.boards.length === 0) {
        return;
      }

      // 1. SELF-ECHO GUARD: Ignore updates that were published by this same client session!
      if (remoteRaw._clientId === CLIENT_ID) {
        return;
      }

      // 2. ACTIVE PENDING LOCAL EDITS GUARD:
      // If this client is currently debouncing a save or has an in-flight push,
      // local state has active pending changes that must NOT be overwritten by older cloud data!
      if (cloudSaveTimeout !== null || isPushingToCloud) {
        return;
      }

      // 3. TIMESTAMP GUARD:
      // If the incoming cloud update is older than or equal to our last local modification, ignore it.
      if (remoteRaw._updatedAt && remoteRaw._updatedAt <= lastLocalEditTimestamp) {
        return;
      }

      const remoteData: AppData = {
        boards: remoteRaw.boards,
        activeBoardId: remoteRaw.activeBoardId,
      };

      // 4. CANONICAL EQUALITY GUARD:
      // If the cloud state is structurally identical to our local state, avoid redundant re-renders.
      if (latestLocalData && canonicalStringify(latestLocalData) === canonicalStringify(remoteData)) {
        return;
      }

      // This is a legitimate newer update from another device (e.g. iPhone)
      latestLocalData = remoteData;
      lastLocalEditTimestamp = remoteRaw._updatedAt || Date.now();

      // Cache locally
      const json = JSON.stringify(remoteData);
      localStorage.setItem(STORAGE_KEY, json);
      if (isElectron() && window.electronAPI?.saveData) {
        window.electronAPI.saveData(remoteData);
      }

      // Notify React component
      onRemoteUpdate(remoteData);
    } catch (err) {
      console.warn('Failed fetching full cloud state:', err);
    } finally {
      isFetching = false;
      if (hasPendingFetch) {
        hasPendingFetch = false;
        handleUpdate();
      }
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
      () => {
        handleUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
