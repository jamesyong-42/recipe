import { PlusCircle, Clipboard, Shapes } from 'lucide-react';

interface HeaderProps {
  snippetCount: number;
  onNewSnippet: () => void;
  onPasteSnippet: () => void;
}

export function Header({ snippetCount, onNewSnippet, onPasteSnippet }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-left">
        <div className="window-controls">
          <div className="window-dot" />
          <div className="window-dot" />
          <div className="window-dot" />
        </div>

        <div className="header-title">
          <div className="header-logo">
            <Shapes size={18} strokeWidth={1.5} />
          </div>
          <span className="header-name">UI Snippets</span>
        </div>

        <div className="header-stats">
          <span>{snippetCount} snippets</span>
        </div>
      </div>

      <div className="header-actions">
        <button className="header-btn" onClick={onPasteSnippet} title="Paste from clipboard (Cmd/Ctrl+V)">
          <Clipboard size={18} />
          <span>Paste</span>
        </button>
        <button className="header-btn" onClick={onNewSnippet}>
          <PlusCircle size={18} />
          <span>New Snippet</span>
        </button>
      </div>
    </div>
  );
}
