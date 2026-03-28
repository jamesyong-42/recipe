import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSupabase } from '../contexts/SupabaseContext';
import {
  loadSnippetsFromSupabase,
  addSnippetToSupabase,
  updateSnippetInSupabase,
  deleteSnippetFromSupabase,
  loadSnippetsFromStorage,
  saveSnippetsToStorage,
} from '../lib/supabase';
import type { Snippet, SnippetType } from '../types';

function detectSnippetType(code: string): SnippetType {
  const trimmed = code.trim();

  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return 'html';
  }

  if (/^import\s+.*from\s+['"]react['"]/m.test(trimmed)) {
    return 'react';
  }

  if (/className\s*=\s*["'{]|onClick\s*=\s*\{|onChange\s*=\s*\{|onSubmit\s*=\s*\{/.test(trimmed)) {
    return 'react';
  }

  if (/^import\s+/m.test(trimmed) || /^export\s+(default\s+)?(function|const|class)\s+/m.test(trimmed)) {
    return 'react';
  }

  if (/^<(body|div|section|main|header|nav|article|aside|footer|form|table|ul|ol|p|h[1-6]|span|a|img)/i.test(trimmed)) {
    return 'html';
  }

  if (/^(const|function)\s+[A-Z]\w*\s*=?\s*(\(|=>)/m.test(trimmed)) {
    return 'react';
  }

  return 'html';
}

export function useSnippets() {
  const { client, connectionKey } = useSupabase();
  const clientRef = useRef(client);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep ref in sync so callbacks always have the latest client
  useEffect(() => {
    clientRef.current = client;
  }, [client]);

  // Load snippets on mount and when connection changes
  useEffect(() => {
    async function loadSnippets() {
      setLoading(true);
      if (client) {
        const data = await loadSnippetsFromSupabase(client);
        setSnippets(data);
      } else {
        setSnippets(loadSnippetsFromStorage());
      }
      setLoading(false);
    }
    loadSnippets();
  }, [client, connectionKey]);

  // Save to localStorage when not using Supabase
  useEffect(() => {
    if (!client && !loading) {
      saveSnippetsToStorage(snippets);
    }
  }, [snippets, loading, client]);

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

    setSnippets((prev) => [newSnippet, ...prev]);

    const c = clientRef.current;
    if (c) {
      const success = await addSnippetToSupabase(c, newSnippet);
      if (!success) {
        setSnippets((prev) => prev.filter((s) => s.id !== newSnippet.id));
        return null;
      }
    }

    return newSnippet;
  }, []);

  const updateSnippet = useCallback(
    async (id: string, updates: Partial<Pick<Snippet, 'title' | 'code' | 'type'>>) => {
      const updatedType = updates.code ? detectSnippetType(updates.code) : undefined;

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

      const c = clientRef.current;
      if (c) {
        await updateSnippetInSupabase(c, id, {
          ...updates,
          type: updatedType,
        });
      }
    },
    []
  );

  const deleteSnippet = useCallback(async (id: string) => {
    const deletedSnippet = snippets.find((s) => s.id === id);

    setSnippets((prev) => prev.filter((s) => s.id !== id));

    const c = clientRef.current;
    if (c) {
      const success = await deleteSnippetFromSupabase(c, id);
      if (!success && deletedSnippet) {
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
    isCloud: !!client,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    getSnippet,
  };
}
