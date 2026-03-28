import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as manager from '../lib/supabase';

interface SupabaseContextValue {
  client: SupabaseClient | null;
  isConnected: boolean;
  connectionSource: 'runtime' | 'env' | null;
  connectionKey: number;
  connect: (url: string, anonKey: string) => Promise<{ ok: boolean; error?: string }>;
  disconnect: () => void;
  config: { url: string; anonKey: string } | null;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(manager.getClient);
  const [connectionSource, setConnectionSource] = useState(manager.getConnectionSource);
  const [connectionKey, setConnectionKey] = useState(0);
  const [config, setConfig] = useState(manager.getConfig);

  const connect = useCallback(async (url: string, anonKey: string) => {
    try {
      const newClient = manager.connect(url, anonKey);

      // Test connection
      const { error } = await newClient.from('snippets').select('id').limit(1);
      if (error) {
        // Roll back — disconnect the bad credentials
        manager.disconnect();
        setClient(manager.getClient());
        setConnectionSource(manager.getConnectionSource());
        setConfig(manager.getConfig());
        return { ok: false, error: error.message };
      }

      setClient(newClient);
      setConnectionSource('runtime');
      setConfig(manager.getConfig());
      setConnectionKey((k) => k + 1);
      return { ok: true };
    } catch (e) {
      manager.disconnect();
      setClient(manager.getClient());
      setConnectionSource(manager.getConnectionSource());
      setConfig(manager.getConfig());
      return { ok: false, error: e instanceof Error ? e.message : 'Connection failed' };
    }
  }, []);

  const disconnect = useCallback(() => {
    manager.disconnect();
    setClient(manager.getClient());
    setConnectionSource(manager.getConnectionSource());
    setConfig(manager.getConfig());
    setConnectionKey((k) => k + 1);
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        client,
        isConnected: client !== null,
        connectionSource,
        connectionKey,
        connect,
        disconnect,
        config,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextValue {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used within SupabaseProvider');
  return ctx;
}
