export interface WCARegulation {
  id: string;
  articleId: string;
  articleTitle: string;
  content: string;
  label?: string;
  indentationLevel: number;
  crossReferences: string[];
}

export interface WCAArticle {
  id: string;
  title: string;
  regulations: WCARegulation[];
}

export interface WCAParsedData {
  version: string;
  notes: string[];
  articles: WCAArticle[];
  regulationsById?: Record<string, WCARegulation>;
}

export type FilterView = 'all' | 'favorites';
