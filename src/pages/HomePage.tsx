import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { SnippetGallery } from '../components/SnippetGallery';
import { SettingsModal } from '../components/SettingsModal';
import { useSnippets } from '../hooks/useSnippets';
import type { Snippet } from '../types';

const DEFAULT_SNIPPET = `const App = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-black">Hello World</h1>
      <p className="text-gray-600 mt-2">Edit this snippet to see live changes.</p>
    </div>
  );
};

export default App;`;

export function HomePage() {
  const navigate = useNavigate();
  const { snippets, addSnippet, deleteSnippet } = useSnippets();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        const snippet = await addSnippet(text);
        if (snippet) {
          navigate(`/snippet/${snippet.id}`);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Could not read from clipboard. Please check your browser permissions.');
    }
  }, [addSnippet, navigate]);

  const handleNewSnippet = useCallback(async () => {
    const snippet = await addSnippet(DEFAULT_SNIPPET, 'New Snippet');
    if (snippet) {
      navigate(`/snippet/${snippet.id}`);
    }
  }, [addSnippet, navigate]);

  const handleSnippetClick = useCallback(
    (id: string) => {
      navigate(`/snippet/${id}`);
    },
    [navigate]
  );

  const handleCopy = useCallback(async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSnippet(id);
    },
    [deleteSnippet]
  );

  // Global paste shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Cmd/Ctrl+V when not in an input/editor
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        const isEditor = target.closest('.monaco-editor');

        if (!isInput && !isEditor) {
          e.preventDefault();
          handlePaste();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePaste]);

  return (
    <div className="app">
      <Header
        snippetCount={snippets.length}
        onNewSnippet={handleNewSnippet}
        onPasteSnippet={handlePaste}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <main className="main-content">
        <SnippetGallery
          snippets={snippets}
          onSnippetClick={handleSnippetClick}
          onCopy={handleCopy}
          onDelete={handleDelete}
        />
      </main>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
