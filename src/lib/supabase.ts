import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Snippet, SnippetType } from '../types';

// --- Credential storage ---

const CONFIG_KEY = 'supabase-config';
const SNIPPETS_KEY = 'ui-snippets';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let client: SupabaseClient | null = null;
let currentConfig: SupabaseConfig | null = null;
let connectionSource: 'runtime' | 'env' | null = null;

function initClient(config: SupabaseConfig, source: 'runtime' | 'env') {
  client = createClient(config.url, config.anonKey);
  currentConfig = config;
  connectionSource = source;
}

// Initialize on module load: runtime config takes priority over env vars
function initialize() {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const config: SupabaseConfig = JSON.parse(stored);
      if (config.url && config.anonKey) {
        initClient(config, 'runtime');
        return;
      }
    }
  } catch {
    // Ignore invalid stored config
  }

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    initClient({ url, anonKey }, 'env');
  }
}

initialize();

// --- Public API ---

export function getClient(): SupabaseClient | null {
  return client;
}

export function getConfig(): SupabaseConfig | null {
  return currentConfig;
}

export function isConnected(): boolean {
  return client !== null;
}

export function getConnectionSource(): 'runtime' | 'env' | null {
  return connectionSource;
}

export function getEnvConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && anonKey) return { url, anonKey };
  return null;
}

export function connect(url: string, anonKey: string): SupabaseClient {
  const config: SupabaseConfig = { url, anonKey };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  initClient(config, 'runtime');
  return client!;
}

export function disconnect(): void {
  localStorage.removeItem(CONFIG_KEY);
  client = null;
  currentConfig = null;
  connectionSource = null;

  // Re-initialize from env vars if available
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    initClient({ url, anonKey }, 'env');
  }
}

// --- Supabase CRUD helpers ---

export async function loadSnippetsFromSupabase(c: SupabaseClient): Promise<Snippet[]> {
  const { data, error } = await c
    .from('snippets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load snippets from Supabase:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    code: row.code,
    type: row.type as SnippetType,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }));
}

export async function addSnippetToSupabase(c: SupabaseClient, snippet: Snippet): Promise<boolean> {
  const { error } = await c.from('snippets').upsert({
    id: snippet.id,
    title: snippet.title,
    code: snippet.code,
    type: snippet.type,
    created_at: new Date(snippet.createdAt).toISOString(),
    updated_at: new Date(snippet.updatedAt).toISOString(),
  });

  if (error) {
    console.error('Failed to add snippet to Supabase:', error);
    return false;
  }
  return true;
}

export async function updateSnippetInSupabase(
  c: SupabaseClient,
  id: string,
  updates: Partial<Pick<Snippet, 'title' | 'code' | 'type'>>
): Promise<boolean> {
  const { error } = await c
    .from('snippets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update snippet in Supabase:', error);
    return false;
  }
  return true;
}

export async function deleteSnippetFromSupabase(c: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await c.from('snippets').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete snippet from Supabase:', error);
    return false;
  }
  return true;
}

// --- localStorage helpers ---

export function loadSnippetsFromStorage(): Snippet[] {
  try {
    const stored = localStorage.getItem(SNIPPETS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load snippets from localStorage:', e);
  }
  return [];
}

export function saveSnippetsToStorage(snippets: Snippet[]) {
  try {
    localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
  } catch (e) {
    console.error('Failed to save snippets to localStorage:', e);
  }
}
