import React from 'react';
import { WorkflowImage } from '../types';

interface Props {
  images: WorkflowImage[];
  selectedId: number;
  onSelect: (id: number) => void;
}

export const Sidebar: React.FC<Props> = ({ images, selectedId, onSelect }) => {
  return (
    <aside className="w-64 border-r border-border bg-surface overflow-y-auto">
      <div className="p-4 border-b border-border text-xs uppercase tracking-widest text-muted">Projets</div>
      <div className="p-2 space-y-2">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => onSelect(image.id)}
            className={`w-full text-left p-3 rounded border transition flex items-center gap-3 ${
              selectedId === image.id ? 'border-primary bg-primary/5' : 'border-border bg-surfaceHighlight hover:border-primary/50'
            }`}
          >
            <div className="w-12 h-12 rounded overflow-hidden bg-black/50">
              <img src={image.resultUrl || image.originalUrl} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{image.name}</div>
              <div className="text-xs text-muted">{image.status}</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};
