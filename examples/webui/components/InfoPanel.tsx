import React from 'react';
import { WorkflowImage } from '../types';

export const InfoPanel: React.FC<{ image: WorkflowImage | undefined | null }> = ({ image }) => {
  if (!image) {
    return (
      <div className="h-32 border-t border-border bg-surface px-4 flex items-center text-muted text-sm">
        Aucun projet sélectionné.
      </div>
    );
  }

  return (
    <div className="h-32 border-t border-border bg-surface px-6 py-4 grid grid-cols-4 gap-4 text-sm">
      <div>
        <div className="text-muted text-xs uppercase">Nom</div>
        <div className="text-white font-semibold">{image.name}</div>
      </div>
      <div>
        <div className="text-muted text-xs uppercase">Format</div>
        <div className="text-white font-semibold">{image.format}</div>
      </div>
      <div>
        <div className="text-muted text-xs uppercase">Dimensions</div>
        <div className="text-white font-semibold">{image.dimensions}</div>
      </div>
      <div>
        <div className="text-muted text-xs uppercase">Date</div>
        <div className="text-white font-semibold">{image.date}</div>
      </div>
    </div>
  );
};
