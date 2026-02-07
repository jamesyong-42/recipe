import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Snippet, SnippetType } from '../types';

const STORAGE_KEY = 'ui-snippets';

function detectSnippetType(code: string): SnippetType {
  const trimmed = code.trim();

  // If it starts with HTML doctype or html tag, it's definitely HTML
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return 'html';
  }

  // If it has React-specific imports, it's React
  if (/^import\s+.*from\s+['"]react['"]/m.test(trimmed)) {
    return 'react';
  }

  // If it has JSX-specific attributes (className, onClick, etc.), it's React
  if (/className\s*=\s*["'{]|onClick\s*=\s*\{|onChange\s*=\s*\{|onSubmit\s*=\s*\{/.test(trimmed)) {
    return 'react';
  }

  // If it has import/export statements (ES modules), likely React
  if (/^import\s+/m.test(trimmed) || /^export\s+(default\s+)?(function|const|class)\s+/m.test(trimmed)) {
    return 'react';
  }

  // If it starts with typical HTML tags (without JSX patterns), it's HTML
  if (/^<(body|div|section|main|header|nav|article|aside|footer|form|table|ul|ol|p|h[1-6]|span|a|img)/i.test(trimmed)) {
    return 'html';
  }

  // If it looks like a React component definition
  if (/^(const|function)\s+[A-Z]\w*\s*=?\s*(\(|=>)/m.test(trimmed)) {
    return 'react';
  }

  // Default to HTML for simple markup
  return 'html';
}

// localStorage helpers (fallback)
function loadSnippetsFromStorage(): Snippet[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load snippets from localStorage:', e);
  }
  return [];
}

function saveSnippetsToStorage(snippets: Snippet[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  } catch (e) {
    console.error('Failed to save snippets to localStorage:', e);
  }
}

// Supabase helpers
async function loadSnippetsFromSupabase(): Promise<Snippet[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
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

async function addSnippetToSupabase(snippet: Snippet): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('snippets').insert({
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

async function updateSnippetInSupabase(
  id: string,
  updates: Partial<Pick<Snippet, 'title' | 'code' | 'type'>>
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
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

async function deleteSnippetFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('snippets').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete snippet from Supabase:', error);
    return false;
  }
  return true;
}

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  // Load snippets on mount
  useEffect(() => {
    async function loadSnippets() {
      setLoading(true);
      if (isSupabaseConfigured) {
        const data = await loadSnippetsFromSupabase();
        setSnippets(data);
      } else {
        setSnippets(loadSnippetsFromStorage());
      }
      setLoading(false);
    }
    loadSnippets();
  }, []);

  // Save to localStorage when not using Supabase
  useEffect(() => {
    if (!isSupabaseConfigured && !loading) {
      saveSnippetsToStorage(snippets);
    }
  }, [snippets, loading]);

  const addSnippet = useCallback(async (code: string, title?: string) => {
    const type = detectSnippetType(code);
    const now = Date.now();
    const newSnippet: Snippet = {
      id: uuidv4(),
      title: title || `Snippet ${new Date(now).toLocaleDateString()}`,
      code,
      type,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic update
    setSnippets((prev) => [newSnippet, ...prev]);

    // Persist to Supabase
    if (isSupabaseConfigured) {
      const success = await addSnippetToSupabase(newSnippet);
      if (!success) {
        // Rollback on failure
        setSnippets((prev) => prev.filter((s) => s.id !== newSnippet.id));
        return null;
      }
    }

    return newSnippet;
  }, []);

  const updateSnippet = useCallback(
    async (id: string, updates: Partial<Pick<Snippet, 'title' | 'code' | 'type'>>) => {
      const updatedType = updates.code ? detectSnippetType(updates.code) : undefined;

      // Optimistic update
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...updates,
                type: updatedType || s.type,
                updatedAt: Date.now(),
              }
            : s
        )
      );

      // Persist to Supabase
      if (isSupabaseConfigured) {
        await updateSnippetInSupabase(id, {
          ...updates,
          type: updatedType,
        });
      }
    },
    []
  );

  const deleteSnippet = useCallback(async (id: string) => {
    // Store for potential rollback
    const deletedSnippet = snippets.find((s) => s.id === id);

    // Optimistic update
    setSnippets((prev) => prev.filter((s) => s.id !== id));

    // Persist to Supabase
    if (isSupabaseConfigured) {
      const success = await deleteSnippetFromSupabase(id);
      if (!success && deletedSnippet) {
        // Rollback on failure
        setSnippets((prev) => [...prev, deletedSnippet]);
      }
    }
  }, [snippets]);

  const getSnippet = useCallback(
    (id: string) => {
      return snippets.find((s) => s.id === id);
    },
    [snippets]
  );

  return {
    snippets,
    loading,
    isCloud: isSupabaseConfigured,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    getSnippet,
  };
}
