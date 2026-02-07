import { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, Code, RefreshCw, Loader2 } from 'lucide-react';
import { SnippetPreview } from './SnippetPreview';
import { useInView } from '../hooks/useInView';
import type { Snippet } from '../types';

// Track which snippets have been auto-refreshed this session
const autoRefreshedSnippets = new Set<string>();

interface SnippetCardProps {
  snippet: Snippet;
  onClick: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

const SCALE_FACTOR = 3; // Render at 3x resolution for crisp preview

export function SnippetCard({ snippet, onClick, onCopy, onDelete }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600, scale: 1 / SCALE_FACTOR });

  // Only load Sandpack when card is visible (lazy loading)
  const isVisible = useInView(cardRef);

  useEffect(() => {
    const updateDimensions = () => {
      if (previewRef.current) {
        const { width, height } = previewRef.current.getBoundingClientRect();
        setDimensions({
          width: width * SCALE_FACTOR,
          height: height * SCALE_FACTOR,
          scale: 1 / SCALE_FACTOR,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);

    // Auto-refresh once after initial page load to fix rendering issues (HTML only)
    // React snippets don't need this workaround
    if (!loading && snippet.type === 'html' && !autoRefreshedSnippets.has(snippet.id)) {
      autoRefreshedSnippets.add(snippet.id);
      setTimeout(() => {
        setRefreshKey((k) => k + 1);
      }, 500);
    }
  }, [snippet.id, snippet.type]);

  return (
    <div ref={cardRef} className="snippet-card" onClick={onClick}>
      <div
        ref={previewRef}
        className="snippet-card-preview"
        style={{
          '--preview-width': `${dimensions.width}px`,
          '--preview-height': `${dimensions.height}px`,
          '--preview-scale': dimensions.scale,
        } as React.CSSProperties}
      >
        <div className={`snippet-card-preview-content ${isLoading ? 'loading' : 'loaded'}`}>
          {isVisible && (
            <SnippetPreview
              key={refreshKey}
              code={snippet.code}
              type={snippet.type}
              onLoadingChange={handleLoadingChange}
            />
          )}
        </div>
        {/* Transparent overlay to block all interactions */}
        <div className="snippet-card-overlay" />
        {(!isVisible || isLoading) && (
          <div className="snippet-card-loading">
            <Loader2 size={24} className="spin" />
          </div>
        )}
      </div>

      <div className="snippet-card-footer">
        <div className="snippet-card-info">
          <span className="snippet-card-title">{snippet.title}</span>
          <span className="snippet-card-type">
            <Code size={12} />
            {snippet.type.toUpperCase()}
          </span>
        </div>

        <div className="snippet-card-actions">
          <button
            className="snippet-card-btn"
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          </button>
          <button
            className="snippet-card-btn"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            className="snippet-card-btn snippet-card-btn-danger"
            onClick={handleDelete}
            title="Delete snippet"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
