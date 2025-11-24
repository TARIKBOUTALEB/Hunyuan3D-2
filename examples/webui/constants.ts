import { WorkflowImage } from './types';

const exampleImage = (file: string, id: number): WorkflowImage => ({
  id,
  name: `Projet_${id}`,
  type: 'multi-view',
  originalUrl: `/assets/example_images/${file}`,
  resultUrl: `/assets/example_images/${file}`,
  dimensions: '1024x768',
  size: '1.5 MB',
  format: 'PNG',
  date: new Date().toLocaleDateString(),
  status: 'Complété'
});

export const MOCK_IMAGES: WorkflowImage[] = [
  exampleImage('004.png', 1),
  exampleImage('073.png', 2),
  exampleImage('101.png', 3)
];
