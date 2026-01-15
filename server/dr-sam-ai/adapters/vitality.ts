/**
 * Dr. Sam AI - HFL Vitality App Adapter
 * 
 * Adapter for the HFL Vitality Tracker mobile/web app.
 * Includes HFL product catalog and UTM tracking for links.
 */

import { BaseAdapter } from './base';
import { Product, AdapterConfig } from '../types';

// HFL Product Catalog
export const HFL_PRODUCTS: Product[] = [
  {
    name: 'AlphaViril',
    description: 'Natural testosterone optimization formula for men. Supports healthy T-levels, libido, energy, and muscle development.',
    url: 'https://www.hflsolutions.com/alphaviril',
    categories: ['testosterone', 'mens_health', 'libido', 'energy', 'muscle'],
    benefits: ['Boost testosterone naturally', 'Improve libido', 'Increase energy', 'Support muscle growth'],
  },
  {
    name: 'Body-Brain Energy',
    description: 'All-day physical and mental energy without jitters or crashes. Supports focus, clarity, and sustained vitality.',
    url: 'https://www.hflsolutions.com/body-brain-energy',
    categories: ['energy', 'brain', 'focus', 'fatigue'],
    benefits: ['Sustained energy', 'Mental clarity', 'No jitters', 'Improved focus'],
  },
  {
    name: 'Blood Flow Optimizer',
    description: 'Supports healthy blood circulation throughout the body. Promotes cardiovascular health and optimal blood vessel function.',
    url: 'https://www.hflsolutions.com/blood-flow-optimizer',
    categories: ['circulation', 'heart', 'cardiovascular', 'blood_flow'],
    benefits: ['Improve circulation', 'Heart health', 'Blood vessel function'],
  },
  {
    name: 'Blood Pressure Optimizer',
    description: 'Natural support for healthy blood pressure levels. Promotes proper blood vessel dilation and reduces water retention.',
    url: 'https://www.hflsolutions.com/blood-pressure-optimizer',
    categories: ['blood_pressure', 'heart', 'cardiovascular'],
    benefits: ['Healthy blood pressure', 'Vessel dilation', 'Reduce water retention'],
  },
  {
    name: 'Blood Sugar Optimizer',
    description: 'Supports healthy blood sugar levels and carbohydrate metabolism. Helps reduce sugar cravings.',
    url: 'https://www.hflsolutions.com/blood-sugar-optimizer',
    categories: ['blood_sugar', 'metabolism', 'weight_loss', 'cravings'],
    benefits: ['Blood sugar balance', 'Carb metabolism', 'Reduce cravings'],
  },
  {
    name: 'Cholesterol Optimizer',
    description: 'Natural support for healthy cholesterol profile and lipid metabolism. Supports HDL/LDL balance.',
    url: 'https://www.hflsolutions.com/cholesterol-optimizer',
    categories: ['cholesterol', 'heart', 'cardiovascular', 'lipids'],
    benefits: ['Healthy cholesterol', 'Lipid balance', 'Heart health'],
  },
  {
    name: 'Deep Sleep Formula',
    description: 'Optimize sleep hormones for deep, restorative sleep. Wake up refreshed and energized.',
    url: 'https://www.hflsolutions.com/deep-sleep-formula',
    categories: ['sleep', 'recovery', 'hormones', 'stress'],
    benefits: ['Deep sleep', 'Better recovery', 'Wake refreshed'],
  },
  {
    name: 'Inflame & Pain Relief',
    description: 'Natural support for healthy inflammatory response and joint comfort. Promotes mobility and flexibility.',
    url: 'https://www.hflsolutions.com/inflame-pain-relief',
    categories: ['inflammation', 'pain', 'joints', 'mobility'],
    benefits: ['Reduce inflammation', 'Joint comfort', 'Improved mobility'],
  },
  {
    name: 'Lean Optimizer',
    description: 'Optimize fat-burning hormones and metabolism. Supports healthy weight management and appetite control.',
    url: 'https://www.hflsolutions.com/lean-optimizer',
    categories: ['weight_loss', 'metabolism', 'fat_burning', 'appetite'],
    benefits: ['Boost metabolism', 'Fat burning', 'Appetite control'],
  },
  {
    name: 'Perfect Vitamin D3+K2',
    description: 'Optimal vitamin D3 with K2 for immune support, bone health, and overall vitality.',
    url: 'https://www.hflsolutions.com/perfect-vitamin-d3-k2',
    categories: ['immune', 'bones', 'vitamins', 'health'],
    benefits: ['Immune support', 'Bone health', 'Vitamin D optimization'],
  },
  {
    name: 'ProVanax',
    description: 'Natural mood and anxiety support. Promotes calm, confidence, and emotional balance without drowsiness.',
    url: 'https://www.hflsolutions.com/provanax',
    categories: ['mood', 'anxiety', 'stress', 'mental_health'],
    benefits: ['Reduce anxiety', 'Improve mood', 'Emotional balance'],
  },
  {
    name: 'Stress & Cortisol Relief',
    description: 'Balance stress hormones and support healthy adrenal function. Promotes youthful aging and stress resilience.',
    url: 'https://www.hflsolutions.com/stress-cortisol-relief',
    categories: ['stress', 'cortisol', 'adrenal', 'hormones', 'aging'],
    benefits: ['Lower cortisol', 'Stress resilience', 'Adrenal support'],
  },
];

// UTM parameters for tracking
const UTM_SOURCE = 'vitality_app';
const UTM_MEDIUM = 'dr_sam_ai';

export interface VitalityAdapterConfig extends AdapterConfig {
  utmCampaign?: string;
}

export class VitalityAdapter extends BaseAdapter {
  name = 'vitality';
  private utmCampaign: string;

  constructor(config: VitalityAdapterConfig = {}) {
    super({
      ...config,
      products: config.products || HFL_PRODUCTS,
    });
    this.utmCampaign = config.utmCampaign || 'chat_recommendation';
  }

  /**
   * Format product name as a tracked link
   */
  formatProductLink(productName: string): string {
    const product = this.getProducts().find(
      p => p.name.toLowerCase() === productName.toLowerCase()
    );

    if (!product) {
      return productName;
    }

    const utmParams = new URLSearchParams({
      utm_source: UTM_SOURCE,
      utm_medium: UTM_MEDIUM,
      utm_campaign: this.utmCampaign,
    });

    const url = `${product.url}?${utmParams.toString()}`;
    
    // Return markdown link format
    return `[${productName}](${url})`;
  }

  /**
   * Get custom instructions for Vitality app
   */
  getCustomInstructions(): string {
    return `
You are integrated into the HFL Vitality Tracker app. Users are tracking their health metrics, symptoms, and supplements.

Additional guidelines for this context:
- Reference the user's tracked data when relevant (labs, symptoms, supplements)
- Encourage consistent tracking for better insights
- Suggest adding supplements to their tracking when recommending products
- Be aware that users can upload lab results and photos in this app
- Mention that they can ask you to analyze their lab results or food photos
`;
  }

  /**
   * Process response to ensure proper link formatting
   */
  processResponse(response: string): string {
    // Ensure product names are properly linked
    let processed = response;

    for (const product of this.getProducts()) {
      // Find product mentions that aren't already linked
      const regex = new RegExp(
        `(?<!\\[)\\b${this.escapeRegex(product.name)}\\b(?!\\])(?!\\()`,
        'gi'
      );
      processed = processed.replace(regex, (match) => {
        return this.formatProductLink(match);
      });
    }

    return processed;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Export a pre-configured instance for convenience
export const vitalityAdapter = new VitalityAdapter();
