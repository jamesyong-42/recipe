import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SplitDividerProps {
  codeVisible: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onToggle: () => void;
}

export function SplitDivider({ codeVisible, onMouseDown, onToggle }: SplitDividerProps) {
  return (
    <div className="split-divider" onMouseDown={onMouseDown}>
      <button
        className="split-toggle"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title={codeVisible ? 'Hide code editor' : 'Show code editor'}
      >
        {codeVisible ? <PanelLeftClose size={12} /> : <PanelLeftOpen size={12} />}
      </button>
    </div>
  );
}
