import React from 'react';
import { Upload, Download } from 'lucide-react';

interface Props {
  onImport: (file: File) => void;
  onExport: () => void;
  isExportDisabled?: boolean;
}

export const Header: React.FC<Props> = ({ onImport, onExport, isExportDisabled }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    if (event.target) event.target.value = '';
  };

  return (
    <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="text-primary">Hunyuan3D</span>
        <span className="text-muted">Workflow UI (Demo)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-surfaceHighlight hover:bg-primary/10 border border-border text-sm"
        >
          <Upload size={16} /> Importer
        </button>
        <button
          onClick={onExport}
          disabled={isExportDisabled}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary text-black text-sm font-semibold disabled:opacity-40"
        >
          <Download size={16} /> Exporter
        </button>
        <input ref={inputRef} type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>
    </header>
  );
};
