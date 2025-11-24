export type PipelineStep = 'idle' | 'segmentation' | 'geometry' | 'pbr' | 'rendering' | 'complete';

export type WorkflowStatus = 'Brouillon' | 'Complété' | 'Échoué';

export interface WorkflowImage {
  id: number;
  name: string;
  type: 'multi-view';
  originalUrl: string;
  resultUrl: string;
  dimensions: string;
  size: string;
  format: string;
  date: string;
  status: WorkflowStatus;
}
