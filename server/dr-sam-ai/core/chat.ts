/**
 * Dr. Sam AI - Chat Engine
 * 
 * Main chat functionality that combines personality, knowledge, and AI model.
 */

import OpenAI from 'openai';
import { 
  DrSamRequest, 
  DrSamResponse, 
  DrSamConfig, 
  DrSamAdapter,
  Product
} from '../types';
import { buildSystemPrompt } from './personality';
import { KnowledgeBase, getKnowledgeBase } from './knowledge';

const DEFAULT_MODEL = 'gpt-4.1-mini';

export class DrSamAI {
  private openai: OpenAI;
  private model: string;
  private knowledgeBase: KnowledgeBase;
  private adapter?: DrSamAdapter;

  constructor(config: DrSamConfig = {}) {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
    });
    this.model = config.model || DEFAULT_MODEL;
    this.knowledgeBase = getKnowledgeBase(config.knowledgeBasePath);
    this.adapter = config.adapter;
  }

  /**
   * Main chat method - send a message and get a response
   */
  async chat(request: DrSamRequest): Promise<DrSamResponse> {
    // Get products from adapter or context
    const products = request.context?.products || this.adapter?.getProducts() || [];
    
    // Get custom instructions from adapter or context
    const customInstructions = request.context?.customInstructions || 
                               this.adapter?.getCustomInstructions() || '';

    // Search knowledge base for relevant articles
    const knowledgeContext = this.knowledgeBase.buildKnowledgeContext(
      request.message,
      3 // Max articles to include
    );

    // Build the system prompt with all context
    const systemPrompt = buildSystemPrompt({
      user: request.context?.user,
      healthData: request.context?.healthData,
      products,
      customInstructions,
      knowledgeContext,
    });

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    if (request.history?.length) {
      for (const msg of request.history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Add current message
    messages.push({ role: 'user', content: request.message });

    // Call OpenAI
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    let responseText = completion.choices[0]?.message?.content || '';

    // Process response through adapter if available
    if (this.adapter?.processResponse) {
      responseText = this.adapter.processResponse(responseText);
    }

    // Extract mentioned products
    const mentionedProducts = this.extractMentionedProducts(responseText, products);

    // Format product links if adapter provides formatting
    if (this.adapter && mentionedProducts.length > 0) {
      responseText = this.formatProductLinks(responseText, products);
    }

    // Get sources from knowledge search
    const searchResults = this.knowledgeBase.search(request.message, 3);
    const sources = searchResults.map(article => ({
      title: article.title,
      url: article.url,
      relevance: article.relevance || 0,
    }));

    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(request, responseText);

    return {
      message: responseText,
      sources: sources.length > 0 ? sources : undefined,
      mentionedProducts: mentionedProducts.length > 0 ? mentionedProducts : undefined,
      followUpQuestions,
      usage: {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
      },
    };
  }

  /**
   * Extract product names mentioned in the response
   */
  private extractMentionedProducts(response: string, products: Product[]): string[] {
    const mentioned: string[] = [];
    const responseLower = response.toLowerCase();

    for (const product of products) {
      if (responseLower.includes(product.name.toLowerCase())) {
        mentioned.push(product.name);
      }
    }

    return mentioned;
  }

  /**
   * Format product names as links using adapter
   */
  private formatProductLinks(response: string, products: Product[]): string {
    if (!this.adapter) return response;

    let formatted = response;
    for (const product of products) {
      // Create a regex that matches the product name (case insensitive)
      const regex = new RegExp(`\\b${this.escapeRegex(product.name)}\\b`, 'gi');
      const link = this.adapter.formatProductLink(product.name);
      formatted = formatted.replace(regex, link);
    }

    return formatted;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate contextual follow-up questions
   */
  private generateFollowUpQuestions(request: DrSamRequest, response: string): string[] {
    const questions: string[] = [];

    // Based on user context
    if (request.context?.user?.goals?.length) {
      questions.push(`Would you like a personalized plan for ${request.context.user.goals[0]}?`);
    }

    // Based on health data
    if (request.context?.healthData?.recentLabs?.length) {
      questions.push('Should I explain how to optimize any of your lab values?');
    }

    // Generic follow-ups
    const genericFollowUps = [
      'Would you like me to break this down into daily action steps?',
      'Is there anything specific you\'d like me to clarify?',
      'Would you like supplement recommendations for this?',
    ];

    // Add a generic follow-up if we don't have enough
    while (questions.length < 2 && genericFollowUps.length > 0) {
      questions.push(genericFollowUps.shift()!);
    }

    return questions.slice(0, 3);
  }

  /**
   * Get knowledge base statistics
   */
  getKnowledgeStats() {
    return this.knowledgeBase.getStats();
  }

  /**
   * Search knowledge base directly
   */
  searchKnowledge(query: string, maxResults: number = 5) {
    return this.knowledgeBase.search(query, maxResults);
  }
}

// Factory function for easy instantiation
export function createDrSamAI(config?: DrSamConfig): DrSamAI {
  return new DrSamAI(config);
}
