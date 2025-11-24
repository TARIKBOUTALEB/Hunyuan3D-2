import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MOCK_IMAGES } from './constants';
import { WorkflowImage, PipelineStep } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InfoPanel } from './components/InfoPanel';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Columns,
  Play,
  Box,
  Activity,
  CheckCircle2,
  Sparkles,
  Upload
} from 'lucide-react';

// --- Pipeline Node Component ---
const PipelineNode = ({
  label,
  status,
  active
}: {
  label: string;
  status: 'pending' | 'active' | 'done';
  active?: boolean;
}) => {
  const getColor = () => {
    if (status === 'done') return 'border-primary text-primary bg-primary/10';
    if (status === 'active')
      return 'border-accent text-accent bg-accent/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    return 'border-border text-muted bg-surface';
  };

  return (
    <div className={`relative flex flex-col items-center gap-2 transition-all duration-500 ${active ? 'scale-105' : 'scale-100'}`}>
      <div
        className={`w-32 h-10 rounded-md border-2 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${getColor()}`}
      >
        {label}
        {status === 'active' && <Activity size={12} className="ml-2 animate-pulse" />}
        {status === 'done' && <CheckCircle2 size={12} className="ml-2" />}
      </div>
      {/* Connector Line */}
      <div className="absolute top-1/2 left-full w-8 h-0.5 bg-border -z-10 last:hidden" />
    </div>
  );
};

const PipelineVisualizer = ({ step }: { step: PipelineStep }) => {
  const steps = [
    { id: 'segmentation', label: 'Analyse' },
    { id: 'geometry', label: 'Vues Latérales' },
    { id: 'pbr', label: 'Vue Arrière' },
    { id: 'rendering', label: 'Assemblage' }
  ];

  const getStatus = (id: string): 'pending' | 'active' | 'done' => {
    if (step === 'complete') return 'done';
    if (step === 'idle') return 'pending';

    const currentIndex = steps.findIndex((s) => s.id === step);
    const thisIndex = steps.findIndex((s) => s.id === id);

    if (thisIndex < currentIndex) return 'done';
    if (thisIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (step === 'idle') return null;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-background/90 backdrop-blur-md px-8 py-4 rounded-xl border border-border shadow-2xl flex items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <PipelineNode label={s.label} status={getStatus(s.id)} active={step === s.id} />
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 transition-colors duration-500 ${getStatus(s.id) === 'done' ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [images, setImages] = useState<WorkflowImage[]>(MOCK_IMAGES);
  const [selectedId, setSelectedId] = useState<number | null>(MOCK_IMAGES.length > 0 ? MOCK_IMAGES[0].id : null);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedImage = images.find((img) => img.id === selectedId);

  const handleImageSelect = (id: number) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setZoomLevel(100);
    const img = images.find((i) => i.id === id);
    if (img && img.status === 'Brouillon') {
      setIsComparisonMode(false);
      setPipelineStep('idle');
    } else if (img && img.status === 'Complété') {
      setPipelineStep('complete');
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const newVal = prev + delta;
      return Math.min(Math.max(newVal, 10), 300);
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 1. IMPORT
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newImage: WorkflowImage = {
        id: Date.now(),
        name: file.name.split('.')[0] || 'Projet_' + (images.length + 1),
        type: 'multi-view',
        originalUrl: result,
        resultUrl: '',
        dimensions: '1920x1080', // Approximate placeholder
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        format: file.type.split('/')[1]?.toUpperCase() || 'PNG',
        date: new Date().toLocaleDateString(),
        status: 'Brouillon'
      };
      setImages((prev) => [newImage, ...prev]);
      setSelectedId(newImage.id);
      setPipelineStep('idle');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
    if (event.target) event.target.value = '';
  };

  // 2. GENERATE WITH FAKE WORKFLOW STEPS
  const handleGenerate = async () => {
    if (!selectedImage || selectedImage.status !== 'Brouillon' || pipelineStep !== 'idle') return;

    // Start Workflow
    setPipelineStep('segmentation');

    try {
      const viteApiKey =
        typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_API_KEY : undefined;
      const nodeApiKey = typeof process !== 'undefined' ? process.env?.API_KEY : undefined;
      const apiKey = viteApiKey ?? nodeApiKey;

      // Simulate segmentation processing time
      await new Promise((r) => setTimeout(r, 1200));
      setPipelineStep('geometry');

      const base64Data = selectedImage.originalUrl.split(',')[1];
      const mimeType = selectedImage.originalUrl.split(';')[0].split(':')[1];

      const apiCallPromise = apiKey
        ? new GoogleGenAI({ apiKey }).models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType
                  }
                },
                {
                  // Precise prompt for Multi-view Orientable result
                  text: `Generate a professional 4-view orthographic 3D reference sheet based exactly on the object in the input image.
              The output image must contain these 4 specific views arranged horizontally in a clean grid:
              1. **Original View**: Respect the starting pose of the input image exactly.
              2. **Left Side View**: A perfect profile view from the left.
              3. **Right Side View**: A perfect profile view from the right.
              4. **Back View**: A view directly from behind the object.

              Strictly maintain the object's geometry, textures, colors, and proportions across all 4 angles.
              Style: High-quality PBR render, neutral studio lighting, solid dark grey background (#18181b).
              This is for 3D modeling reference, so alignment and consistency are key.`
                }
              ]
            }
          })
        : Promise.resolve({ candidates: [{ content: { parts: [{ inlineData: { data: base64Data } }] } }] });

      // Simulate Geometry processing
      await new Promise((r) => setTimeout(r, 2000));
      setPipelineStep('pbr');

      // Simulate PBR processing
      await new Promise((r) => setTimeout(r, 1500));
      setPipelineStep('rendering');

      const response = await apiCallPromise;

      let generatedImageUrl = '';
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!generatedImageUrl) throw new Error('No image generated');

      setImages((prev) =>
        prev.map((img) => {
          if (img.id === selectedId) {
            return {
              ...img,
              resultUrl: generatedImageUrl,
              status: 'Complété',
              type: 'multi-view'
            };
          }
          return img;
        })
      );

      setPipelineStep('complete');
      setIsComparisonMode(false); // Just show the result for multi-view
    } catch (error) {
      console.error('Generation failed:', error);
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === selectedId) return { ...img, status: 'Échoué' };
          return img;
        })
      );
      setPipelineStep('idle');
      alert('Erreur de génération. Veuillez vérifier votre clé API ou réessayer.');
    }
  };

  const handleDownload = () => {
    if (!selectedImage || !selectedImage.resultUrl) return;
    const link = document.createElement('a');
    link.href = selectedImage.resultUrl;
    link.download = `${selectedImage.name}_multi-view.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-text overflow-hidden selection:bg-primary/30">
      <Header onImport={handleImport} onExport={handleDownload} isExportDisabled={!selectedImage || selectedImage.status !== 'Complété'} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar images={images} selectedId={selectedId || 0} onSelect={handleImageSelect} />

        <main className="flex-1 flex flex-col relative min-w-0 bg-[#0a0a0c]">
          {/* Main Toolbar */}
          <div className="h-12 border-b border-border bg-surface px-4 flex justify-between items-center z-20">
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-muted mr-2">OPÉRATIONS:</span>
              <button
                onClick={() => setIsComparisonMode(!isComparisonMode)}
                disabled={!selectedImage}
                className={`p-1.5 rounded transition ${isComparisonMode ? 'text-primary bg-primary/10' : 'text-muted hover:bg-surfaceHighlight'} disabled:opacity-30`}
                title="Comparer"
              >
                <Columns size={16} />
              </button>
              <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-surfaceHighlight text-muted transition" title="Plein écran">
                <Maximize size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => handleZoom(-10)} className="text-muted hover:text-white disabled:opacity-30" disabled={!selectedImage}>
                <ZoomOut size={14} />
              </button>
              <div className="w-24 h-1 bg-surfaceHighlight rounded overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(zoomLevel / 300) * 100}%` }}></div>
              </div>
              <span className="text-xs font-mono text-muted w-10">{zoomLevel}%</span>
              <button onClick={() => handleZoom(10)} className="text-muted hover:text-white disabled:opacity-30" disabled={!selectedImage}>
                <ZoomIn size={14} />
              </button>
            </div>
          </div>

          {/* Workflow/Pipeline Visualizer Overlay */}
          <PipelineVisualizer step={pipelineStep} />

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <div
              ref={containerRef}
              className="flex-1 overflow-hidden relative flex items-center justify-center bg-transparent"
              style={{ backgroundImage: 'radial-gradient(circle at center, #18181b 0%, #000000 100%)' }}
            >
              {/* EMPTY STATE */}
              {!selectedImage && (
                <div className="text-center p-12 animate-in fade-in zoom-in duration-500">
                  <div
                    onClick={triggerFileInput}
                    className="w-32 h-32 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center mx-auto mb-6 hover:border-primary hover:bg-surfaceHighlight transition cursor-pointer group"
                  >
                    <Upload size={32} className="text-muted group-hover:text-primary transition" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Démarrer un Workflow</h2>
                  <p className="text-muted text-sm max-w-xs mx-auto mb-8">
                    Importez une image pour générer une planche de référence 3D multi-vues (Face, Dos, Profils).
                  </p>
                  <button onClick={triggerFileInput} className="px-6 py-3 bg-primary text-black font-bold rounded hover:bg-emerald-400 transition">
                    Sélectionner une image
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              )}

              {/* ACTIVE DRAFT STATE */}
              {selectedImage && pipelineStep === 'idle' && selectedImage.status === 'Brouillon' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-surface border border-border p-8 rounded-xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden group">
                    {/* Decorative Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                    <div className="w-20 h-20 bg-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-6 border border-border relative">
                      <img src={selectedImage.originalUrl} className="w-full h-full object-cover rounded-full opacity-40 blur-[1px]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Box size={32} className="text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                      Génération Workflow 3D
                      <Sparkles size={16} className="text-amber-400" />
                    </h2>
                    <p className="text-sm text-muted mb-8 px-4 leading-relaxed">
                      Le pipeline va générer une planche multi-vues (Face, Arrière, Côté Droit, Côté Gauche) prête pour la modélisation 3D.
                    </p>

                    <button
                      onClick={handleGenerate}
                      className="group/btn relative w-full py-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-sm uppercase tracking-widest rounded transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-[1.02] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none mix-blend-overlay"></div>
                      <Play size={18} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
                      Lancer le Workflow
                    </button>
                  </div>
                </div>
              )}

              {/* IMAGE VIEWER */}
              {selectedImage && (
                <div
                  className={`w-full h-full flex items-center justify-center p-8 transition-all duration-700 ${
                    pipelineStep !== 'idle' && pipelineStep !== 'complete' ? 'opacity-20 blur-sm scale-95 grayscale' : 'opacity-100 scale-100'
                  }`}
                >
                  {isComparisonMode ? (
                    <div className="flex gap-4 h-full w-full max-w-6xl">
                      <div className="flex-1 border border-border bg-black/20 rounded relative">
                        <img src={selectedImage.originalUrl} style={{ transform: `scale(${zoomLevel / 100})` }} className="w-full h-full object-contain transition-transform" />
                        <div className="absolute top-2 left-2 text-[10px] font-bold bg-black/50 px-2 py-1 rounded text-muted uppercase border border-white/10">
                          Input
                        </div>
                      </div>
                      <div className="flex-1 border border-primary/30 bg-black/20 rounded relative shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        <img src={selectedImage.resultUrl || selectedImage.originalUrl} style={{ transform: `scale(${zoomLevel / 100})` }} className="w-full h-full object-contain transition-transform" />
                        <div className="absolute top-2 right-2 text-[10px] font-bold bg-primary/20 text-primary px-2 py-1 rounded uppercase border border-primary/20">
                          Rendu
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={selectedImage.resultUrl || selectedImage.originalUrl}
                      alt="Workspace"
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                      className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-300"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom Panel (Info) */}
            <InfoPanel image={selectedImage} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
