/**
 * Dr. Sam AI - Knowledge Retrieval Module
 * 
 * Handles searching and retrieving relevant articles from the knowledge base.
 * Uses keyword matching for now; can be upgraded to embeddings for semantic search.
 */

import fs from 'fs';
import path from 'path';
import { KnowledgeArticle } from '../types';

// Default knowledge base path (relative to this package)
const DEFAULT_KB_PATH = path.join(__dirname, '../knowledge_base');

interface KnowledgeIndex {
  total_articles: number;
  categories: Record<string, number>;
  category_files: Record<string, string>;
}

export class KnowledgeBase {
  private basePath: string;
  private index: KnowledgeIndex | null = null;
  private condensed: KnowledgeArticle[] = [];
  private categoryCache: Map<string, KnowledgeArticle[]> = new Map();

  constructor(basePath?: string) {
    this.basePath = basePath || DEFAULT_KB_PATH;
    this.loadIndex();
  }

  private loadIndex(): void {
    try {
      const indexPath = path.join(this.basePath, 'index.json');
      if (fs.existsSync(indexPath)) {
        this.index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      }

      const condensedPath = path.join(this.basePath, 'condensed.json');
      if (fs.existsSync(condensedPath)) {
        this.condensed = JSON.parse(fs.readFileSync(condensedPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Failed to load knowledge base index:', error);
    }
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return this.index ? Object.keys(this.index.categories) : [];
  }

  /**
   * Get article count for a category
   */
  getCategoryCount(category: string): number {
    return this.index?.categories[category] || 0;
  }

  /**
   * Load articles for a specific category
   */
  private loadCategory(category: string): KnowledgeArticle[] {
    if (this.categoryCache.has(category)) {
      return this.categoryCache.get(category)!;
    }

    try {
      const filePath = path.join(this.basePath, `${category}.json`);
      if (fs.existsSync(filePath)) {
        const articles = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.categoryCache.set(category, articles);
        return articles;
      }
    } catch (error) {
      console.error(`Failed to load category ${category}:`, error);
    }

    return [];
  }

  /**
   * Search for relevant articles based on a query
   * Uses keyword matching with relevance scoring
   */
  search(query: string, maxResults: number = 5): KnowledgeArticle[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    // Score each article
    const scored = this.condensed.map(article => {
      let score = 0;
      const titleLower = article.title.toLowerCase();
      const summaryLower = article.summary.toLowerCase();
      const categoryLower = article.category.toLowerCase();

      // Title matches are most important
      for (const word of queryWords) {
        if (titleLower.includes(word)) score += 10;
        if (summaryLower.includes(word)) score += 3;
        if (categoryLower.includes(word)) score += 5;
      }

      // Exact phrase match in title
      if (titleLower.includes(queryLower)) score += 20;

      // Key points matches
      if (article.key_points) {
        for (const point of article.key_points) {
          for (const word of queryWords) {
            if (point.toLowerCase().includes(word)) score += 2;
          }
        }
      }

      return { ...article, relevance: score };
    });

    // Sort by relevance and return top results
    return scored
      .filter(a => a.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  /**
   * Get articles by category
   */
  getByCategory(category: string, maxResults: number = 10): KnowledgeArticle[] {
    return this.condensed
      .filter(a => a.category === category)
      .slice(0, maxResults);
  }

  /**
   * Build context string from relevant articles for injection into prompt
   */
  buildKnowledgeContext(query: string, maxArticles: number = 3): string {
    const articles = this.search(query, maxArticles);

    if (articles.length === 0) {
      return '';
    }

    let context = '';
    for (const article of articles) {
      context += `\n### ${article.title}\n`;
      context += `Source: ${article.url}\n`;
      if (article.summary) {
        context += `Summary: ${article.summary}\n`;
      }
      if (article.key_points?.length) {
        context += `Key Points:\n`;
        for (const point of article.key_points.slice(0, 3)) {
          context += `- ${point}\n`;
        }
      }
      context += '\n';
    }

    return context;
  }

  /**
   * Get full article content by ID
   */
  getArticleById(id: number): KnowledgeArticle | null {
    return this.condensed.find(a => a.id === id) || null;
  }

  /**
   * Get statistics about the knowledge base
   */
  getStats(): { totalArticles: number; categories: Record<string, number> } {
    return {
      totalArticles: this.index?.total_articles || this.condensed.length,
      categories: this.index?.categories || {},
    };
  }
}

// Singleton instance for convenience
let defaultInstance: KnowledgeBase | null = null;

export function getKnowledgeBase(basePath?: string): KnowledgeBase {
  if (!defaultInstance || basePath) {
    defaultInstance = new KnowledgeBase(basePath);
  }
  return defaultInstance;
}
