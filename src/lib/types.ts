/**
 * Common type definitions for the application
 */

export interface ResearchProgress {
  id: string;
  status: string;
  message: string;
  timestamp: number;
  completed?: number;
  searchQuery?: string;
  sources?: Array<{title: string, url: string, snippet?: string}>;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface ImageSource {
  url: string;
  origin?: string;
  height?: number;
  width?: number;
  context?: string;
}

export interface ResearchResult {
  content: string;
  sources: Source[];
  images?: ImageSource[];
  searchQueries?: string[];
} 