/**
 * Dr. Sam AI - Main Export
 * 
 * Standalone, reusable AI health coaching module.
 * 
 * Usage:
 * ```typescript
 * import { DrSamAI, VitalityAdapter } from 'dr-sam-ai';
 * 
 * const drSam = new DrSamAI({
 *   adapter: new VitalityAdapter(),
 * });
 * 
 * const response = await drSam.chat({
 *   message: "How can I improve my testosterone levels?",
 *   context: {
 *     user: { name: "John", age: 45, sex: "male" },
 *   },
 * });
 * ```
 */

// Core exports
export { DrSamAI, createDrSamAI } from './core/chat';
export { KnowledgeBase, getKnowledgeBase } from './core/knowledge';
export { buildSystemPrompt, DR_SAM_PERSONA } from './core/personality';

// Adapter exports
export { BaseAdapter, SimpleAdapter } from './adapters/base';
export { VitalityAdapter, HFL_PRODUCTS, vitalityAdapter } from './adapters/vitality';

// Type exports
export type {
  DrSamRequest,
  DrSamResponse,
  DrSamConfig,
  DrSamContext,
  DrSamAdapter,
  UserProfile,
  HealthData,
  Product,
  ChatMessage,
  KnowledgeArticle,
  AdapterConfig,
} from './types';

// Version
export const VERSION = '1.0.0';
