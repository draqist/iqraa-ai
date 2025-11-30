export interface ContentNode {
  id: string;
  order: number;
  text_arabic: string;
  text_english: string;
  node_type: 'verse' | 'line';
}

export interface Book {
  id: string;
  title_en: string;
  title_ar: string;
  author: string;
  cover_image: string;
  nodes: ContentNode[];
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  isAI?: boolean;
}
