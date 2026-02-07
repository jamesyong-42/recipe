import { useState, useCallback } from 'react';
import { ArrowLeft, Copy, Check, Trash2, Code, RefreshCw, Loader2 } from 'lucide-react';
import { ReactEditor } from './ReactEditor';
import { HtmlEditor } from './HtmlEditor';
import type { Snippet } from '../types';

// Track which snippets have been auto-refreshed this session in editor
const autoRefreshedInEditor = new Set<string>();

interface SnippetEditorProps {
  snippet: Snippet;
  onBack: () => void;
  onUpdate: (updates: Partial<Pick<Snippet, 'title' | 'code'>>) => void;
  onCopy: () => void;
  onDelete: () => void;
}

export function SnippetEditor({
  snippet,
  onBack,
  onUpdate,
  onCopy,
  onDelete,
}: SnippetEditorProps) {
  const [title, setTitle] = useState(snippet.title);
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentCode, setCurrentCode] = useState(snippet.code);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCurrentCode(newCode);
      onUpdate({ code: newCode });
    },
    [onUpdate]
  );

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    if (title !== snippet.title) {
      onUpdate({ title });
    }
  }, [title, snippet.title, onUpdate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('Delete this snippet?')) {
      onDelete();
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);

    // Auto-refresh once after initial page load to fix rendering issues (HTML only)
    // React snippets don't need this workaround
    if (!loading && snippet.type === 'html' && !autoRefreshedInEditor.has(snippet.id)) {
      autoRefreshedInEditor.add(snippet.id);
      setTimeout(() => {
        setRefreshKey((k) => k + 1);
      }, 500);
    }
  }, [snippet.id, snippet.type]);

  return (
    <div className="editor-view">
      <div className="editor-header">
        <div className="editor-header-left">
          <button className="editor-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="editor-title-container">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                className="editor-title-input"
                autoFocus
              />
            ) : (
              <h1
                className="editor-title"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit"
              >
                {snippet.title}
              </h1>
            )}
            <span className="editor-type">
              <Code size={14} />
              {snippet.type.toUpperCase()}
            </span>
            {isLoading && (
              <span className="editor-loading">
                <Loader2 size={14} className="spin" />
                <span>Loading...</span>
              </span>
            )}
          </div>
        </div>

        <div className="editor-header-actions">
          <button className="header-btn" onClick={handleRefresh} title="Refresh preview">
            <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="header-btn" onClick={handleCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button className="header-btn header-btn-danger" onClick={handleDelete}>
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {snippet.type === 'react' ? (
        <ReactEditor
          code={snippet.code}
          onCodeChange={handleCodeChange}
          refreshKey={refreshKey}
          onLoadingChange={handleLoadingChange}
        />
      ) : (
        <HtmlEditor
          code={snippet.code}
          onCodeChange={handleCodeChange}
          refreshKey={refreshKey}
          onLoadingChange={handleLoadingChange}
        />
      )}
    </div>
  );
}
