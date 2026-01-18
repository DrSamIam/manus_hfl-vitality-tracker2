'use client';

import { useState } from 'react';
import { ExternalLink, Star, Sparkles } from 'lucide-react';

const products = [
  {
    id: '1',
    name: 'Testosterone Booster Pro',
    description: 'Natural testosterone support with clinically studied ingredients including Tongkat Ali, Ashwagandha, and Fenugreek.',
    price: '$49.95',
    rating: 4.8,
    reviews: 1250,
    image: '💪',
    url: 'https://healthfitnesslongevity.com/testosterone-booster-pro?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: true,
  },
  {
    id: '2',
    name: 'Estrogen Balance',
    description: 'Supports healthy estrogen metabolism with DIM, Calcium D-Glucarate, and Broccoli Extract.',
    price: '$39.95',
    rating: 4.7,
    reviews: 890,
    image: '⚖️',
    url: 'https://healthfitnesslongevity.com/estrogen-balance?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '3',
    name: 'Sleep Optimizer',
    description: 'Deep sleep support with Magnesium Glycinate, L-Theanine, GABA, and Melatonin.',
    price: '$34.95',
    rating: 4.9,
    reviews: 2100,
    image: '😴',
    url: 'https://healthfitnesslongevity.com/sleep-optimizer?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: true,
  },
  {
    id: '4',
    name: 'Metabolic Fire',
    description: 'Thermogenic fat burner with Green Tea Extract, Caffeine, Capsaicin, and L-Carnitine.',
    price: '$44.95',
    rating: 4.6,
    reviews: 780,
    image: '🔥',
    url: 'https://healthfitnesslongevity.com/metabolic-fire?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '5',
    name: 'Gut Health Pro',
    description: 'Complete digestive support with 50 billion CFU probiotics, prebiotics, and digestive enzymes.',
    price: '$42.95',
    rating: 4.8,
    reviews: 1560,
    image: '🦠',
    url: 'https://healthfitnesslongevity.com/gut-health-pro?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '6',
    name: 'Stress Shield',
    description: 'Adaptogenic stress support with Ashwagandha KSM-66, Rhodiola, and Holy Basil.',
    price: '$36.95',
    rating: 4.7,
    reviews: 920,
    image: '🛡️',
    url: 'https://healthfitnesslongevity.com/stress-shield?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: true,
  },
  {
    id: '7',
    name: 'Joint Flex Plus',
    description: 'Joint mobility support with Glucosamine, Chondroitin, MSM, and Turmeric.',
    price: '$38.95',
    rating: 4.6,
    reviews: 650,
    image: '🦴',
    url: 'https://healthfitnesslongevity.com/joint-flex-plus?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '8',
    name: 'Brain Boost Elite',
    description: 'Cognitive enhancement with Lion\'s Mane, Bacopa, Alpha-GPC, and Phosphatidylserine.',
    price: '$54.95',
    rating: 4.9,
    reviews: 1890,
    image: '🧠',
    url: 'https://healthfitnesslongevity.com/brain-boost-elite?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '9',
    name: 'Heart Health Formula',
    description: 'Cardiovascular support with CoQ10, Omega-3, Vitamin K2, and Hawthorn Berry.',
    price: '$46.95',
    rating: 4.8,
    reviews: 1120,
    image: '❤️',
    url: 'https://healthfitnesslongevity.com/heart-health-formula?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '10',
    name: 'Immune Defense Max',
    description: 'Immune system support with Vitamin C, D3, Zinc, Elderberry, and Quercetin.',
    price: '$32.95',
    rating: 4.7,
    reviews: 2340,
    image: '🛡️',
    url: 'https://healthfitnesslongevity.com/immune-defense-max?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '11',
    name: 'Energy Surge',
    description: 'Clean energy formula with B-Vitamins, CoQ10, Cordyceps, and Rhodiola.',
    price: '$34.95',
    rating: 4.6,
    reviews: 890,
    image: '⚡',
    url: 'https://healthfitnesslongevity.com/energy-surge?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
  {
    id: '12',
    name: 'Longevity Complex',
    description: 'Anti-aging support with NMN, Resveratrol, Pterostilbene, and Fisetin.',
    price: '$79.95',
    rating: 4.9,
    reviews: 560,
    image: '🧬',
    url: 'https://healthfitnesslongevity.com/longevity-complex?utm_source=app&utm_medium=link&utm_campaign=vitality-tracker&coupon=fk-cpn-43p',
    recommended: false,
  },
];

export default function ProductsPage() {
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');

  const filteredProducts = filter === 'recommended' 
    ? products.filter(p => p.recommended)
    : products;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HFL Products</h1>
          <p className="text-gray-600">Premium supplements for your health journey</p>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-start gap-4">
          <Sparkles size={32} />
          <div>
            <h3 className="font-semibold text-lg mb-1">Personalized Recommendations</h3>
            <p className="text-purple-100">Based on your symptoms and biomarkers, Dr. Sam AI recommends Testosterone Booster Pro, Sleep Optimizer, and Stress Shield for optimal results.</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Products
        </button>
        <button
          onClick={() => setFilter('recommended')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'recommended' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Recommended for You
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {product.recommended && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium px-3 py-1 text-center">
                ⭐ Recommended for You
              </div>
            )}
            <div className="p-6">
              <div className="text-4xl mb-4 text-center">{product.image}</div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="font-medium text-gray-900">{product.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500">{product.reviews.toLocaleString()} reviews</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary-600">{product.price}</span>
                <a 
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Learn More
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
