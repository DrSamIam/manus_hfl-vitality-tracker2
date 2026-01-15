/**
 * Dr. Sam AI - Type Definitions
 */

// User profile for context injection
export interface UserProfile {
  name?: string;
  age?: number;
  sex?: 'male' | 'female';
  goals?: string[];
  symptoms?: string[];
}

// Health data for personalized responses
export interface HealthData {
  recentLabs?: Array<{
    name: string;
    value: number;
    unit: string;
    date?: string;
    status?: 'optimal' | 'low' | 'high' | 'borderline';
  }>;
  recentSymptoms?: Array<{
    name: string;
    severity: number; // 1-10
    date?: string;
  }>;
  supplements?: Array<{
    name: string;
    dosage?: string;
  }>;
}

// Product for recommendations
export interface Product {
  name: string;
  description: string;
  url: string;
  categories: string[];
  benefits?: string[];
}

// Context provided by the adapter/project
export interface DrSamContext {
  user?: UserProfile;
  healthData?: HealthData;
  products?: Product[];
  customInstructions?: string;
}

// Chat message format
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Request to Dr. Sam AI
export interface DrSamRequest {
  message: string;
  history?: ChatMessage[];
  context?: DrSamContext;
}

// Knowledge article from the knowledge base
export interface KnowledgeArticle {
  id: number;
  category: string;
  title: string;
  url: string;
  summary: string;
  content?: string;
  key_points?: string[];
  relevance?: number;
}

// Response from Dr. Sam AI
export interface DrSamResponse {
  message: string;
  sources?: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
  mentionedProducts?: string[];
  followUpQuestions?: string[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Adapter configuration
export interface AdapterConfig {
  products?: Product[];
  customInstructions?: string;
  maxKnowledgeArticles?: number;
}

// Main Dr. Sam AI configuration
export interface DrSamConfig {
  openaiApiKey?: string;
  model?: string;
  knowledgeBasePath?: string;
  adapter?: DrSamAdapter;
}

// Adapter interface - implement this for each project
export interface DrSamAdapter {
  name: string;
  getProducts(): Product[];
  getCustomInstructions(): string;
  formatProductLink(productName: string): string;
  processResponse?(response: string): string;
}
