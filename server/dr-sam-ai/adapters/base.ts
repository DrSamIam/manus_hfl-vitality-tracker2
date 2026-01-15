/**
 * Dr. Sam AI - Base Adapter
 * 
 * Base class for project-specific adapters.
 * Extend this class to create adapters for different projects.
 */

import { DrSamAdapter, Product, AdapterConfig } from '../types';

export abstract class BaseAdapter implements DrSamAdapter {
  abstract name: string;
  protected config: AdapterConfig;

  constructor(config: AdapterConfig = {}) {
    this.config = config;
  }

  /**
   * Get the product catalog for this project
   */
  getProducts(): Product[] {
    return this.config.products || [];
  }

  /**
   * Get custom instructions for this project
   */
  getCustomInstructions(): string {
    return this.config.customInstructions || '';
  }

  /**
   * Format a product name as a link
   * Override this in subclasses for project-specific link formatting
   */
  abstract formatProductLink(productName: string): string;

  /**
   * Optional: Process the response before returning
   * Override this for project-specific response processing
   */
  processResponse?(response: string): string;
}

/**
 * Simple adapter for basic usage without project-specific customization
 */
export class SimpleAdapter extends BaseAdapter {
  name = 'simple';

  formatProductLink(productName: string): string {
    // Just return the product name as-is (no linking)
    return productName;
  }
}
