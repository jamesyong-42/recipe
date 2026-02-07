import { Shapes } from 'lucide-react';
import { SnippetCard } from './SnippetCard';
import type { Snippet } from '../types';

interface SnippetGalleryProps {
  snippets: Snippet[];
  onSnippetClick: (id: string) => void;
  onCopy: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export function SnippetGallery({ snippets, onSnippetClick, onCopy, onDelete }: SnippetGalleryProps) {
  if (snippets.length === 0) {
    return (
      <div className="empty-state">
        <Shapes size={64} strokeWidth={1} />
        <h2>No snippets yet</h2>
        <p>
          Paste a UI snippet from your clipboard or click "New Snippet" to get started.
          <br />
          Press <kbd>Cmd/Ctrl</kbd> + <kbd>V</kbd> anywhere to quick-paste.
        </p>
      </div>
    );
  }

  return (
    <div className="snippet-gallery">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onClick={() => onSnippetClick(snippet.id)}
          onCopy={() => onCopy(snippet)}
          onDelete={() => onDelete(snippet.id)}
        />
      ))}
    </div>
  );
}
