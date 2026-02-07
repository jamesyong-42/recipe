export type SnippetType = 'html' | 'react';

export interface Snippet {
  id: string;
  title: string;
  code: string;
  type: SnippetType;
  createdAt: number;
  updatedAt: number;
}

