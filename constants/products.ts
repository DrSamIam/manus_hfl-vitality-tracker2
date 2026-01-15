export interface Product {
  name: string;
  category: string;
  primaryBenefits: string;
  relatedGoals: string[];
  relatedSymptoms: string[];
  shortDescription: string;
  productUrl: string;
  imageUrl: string;
  forGender: "Male" | "Female" | "Both";
}

export const products: Product[] = [
  {
    name: "AlphaViril",
    category: "Testosterone, Hormones, Energy, Libido, Erections, Muscle Growth",
    primaryBenefits: "Boosts testosterone & optimizes \"youth\" hormones (estrogen, DHT, dopamine & Cortisol)",
    relatedGoals: [
      "Optimize testosterone",
      "Improve libido & sexual performance",
      "Increase energy & reduce fatigue",
      "Build muscle & lose fat",
      "Improve mood & mental clarity"
    ],
    relatedSymptoms: [
      "Low energy",
      "Reduced libido",
      "Low motivation",
      "Erectile dysfunction",
      "Poor sleep"
    ],
    shortDescription: "26+ year, doctor formulated, natural solution for boosting testosterone, optimizing hormones, improving sex drive & promoting harder erections.",
    productUrl: "https://healthfitnesslongevity.com/alphaviril/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/av/slider/bottle-thumb.webp",
    forGender: "Male"
  },
  {
    name: "Body-Brain Energy",
    category: "Physical Energy, Mental Focus, Memory, Nootropic, Brain Health, Anti-Aging",
    primaryBenefits: "Increases energy, mental performance, focus & memory. Anti-aging benefits.",
    relatedGoals: [
      "Increase energy & reduce fatigue",
      "Improve mood & mental clarity",
      "Better sleep & recovery"
    ],
    relatedSymptoms: [
      "Low energy",
      "Brain fog",
      "Low motivation",
      "Poor sleep"
    ],
    shortDescription: "22+ year, doctor formulated, nootropic herbal solution that increases physical energy, improves mental performance & memory.",
    productUrl: "https://healthfitnesslongevity.com/body-brain-energy/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bbe/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Blood Flow Optimizer",
    category: "Blood Flow & Circulation, Arterial Health",
    primaryBenefits: "Nitric oxide booster, improving blood flow & blood vessel strength.",
    relatedGoals: [
      "Improve libido & sexual performance",
      "Increase energy & reduce fatigue",
      "Improve mood & mental clarity"
    ],
    relatedSymptoms: [
      "Erectile dysfunction",
      "Low energy",
      "Brain fog"
    ],
    shortDescription: "21+ year, doctor formulated, herbal solution that helps promote youthful blood flow & circulation to your organs, brain, skin, hair & extremities.",
    productUrl: "https://healthfitnesslongevity.com/blood-flow-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bfo/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Blood Pressure Optimizer",
    category: "Blood Pressure & Kidney Health",
    primaryBenefits: "Lowers blood pressure, improves heart, kidney & brain function.",
    relatedGoals: [
      "Improve mood & mental clarity",
      "Increase energy & reduce fatigue"
    ],
    relatedSymptoms: [
      "Erectile dysfunction",
      "Brain fog"
    ],
    shortDescription: "21+ year, doctor formulated, herbal solution that helps promote healthy blood pressure, improving heart, kidney & brain health.",
    productUrl: "https://healthfitnesslongevity.com/blood-pressure-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bpo/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Blood Sugar Optimizer",
    category: "Blood Sugar Control, Insulin Sensitivity & Carb Metabolism",
    primaryBenefits: "Lowers blood sugar, A1c & insulin levels. Reduces sugar cravings & improves carbohydrate metabolism.",
    relatedGoals: [
      "Increase energy & reduce fatigue",
      "Build muscle & lose fat",
      "Improve mood & mental clarity"
    ],
    relatedSymptoms: [
      "Low energy",
      "Brain fog",
      "Low motivation"
    ],
    shortDescription: "24+ year, doctor formulated, herbal solution that helps lower blood sugar, improves GLP-1 & reduces sugar cravings.",
    productUrl: "https://healthfitnesslongevity.com/blood-sugar-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bso/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Cholesterol Optimizer",
    category: "Healthy Cholesterol, HDL/LDL, Triglycerides & Homocysteine",
    primaryBenefits: "Lowers cholesterol, improves HDL/LDL, lowers triglycerides & homocysteine levels.",
    relatedGoals: [
      "Improve mood & mental clarity",
      "Increase energy & reduce fatigue"
    ],
    relatedSymptoms: [
      "Low energy"
    ],
    shortDescription: "26+ year, doctor formulated, herbal solution that helps lower cholesterol, balance HDL/LDL levels and improves triglycerides + homocysteine.",
    productUrl: "https://healthfitnesslongevity.com/cholesterol-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/co/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Deep Sleep Formula",
    category: "Deeper, Quality, Restorative & Youthful Sleep",
    primaryBenefits: "Improves sleep quality & duration. Helps you fall asleep faster & stay asleep longer.",
    relatedGoals: [
      "Better sleep & recovery",
      "Increase energy & reduce fatigue",
      "Optimize testosterone",
      "Improve mood & mental clarity"
    ],
    relatedSymptoms: [
      "Poor sleep",
      "Low energy",
      "Brain fog",
      "Low motivation"
    ],
    shortDescription: "A 14+ year, doctor formulated, herbal solution to helps you fall asleep faster & stay asleep longer. Relaxes the body & mind. No grogginess, wake up refreshed.",
    productUrl: "https://healthfitnesslongevity.com/deep-sleep-formula/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/dsf/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Inflame & Pain Relief",
    category: "Inflammation & Pain; Immune + Joint Support",
    primaryBenefits: "Lowers inflammation, reduces pain, improves joint mobility & flexibility, gut health & immune function.",
    relatedGoals: [
      "Better sleep & recovery",
      "Increase energy & reduce fatigue",
      "Improve mood & mental clarity"
    ],
    relatedSymptoms: [
      "Joint pain",
      "Low energy",
      "Brain fog"
    ],
    shortDescription: "17+ year, doctor formulated, herbal solution that helps reduce pain & inflammation, promoting healthy joint, brain & immune function.",
    productUrl: "https://healthfitnesslongevity.com/inflame-pain-relief/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/ipr/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Lean Optimizer",
    category: "Weight Loss, Appetite Suppression & Faster Metabolism",
    primaryBenefits: "Weight loss, increases fat-burning hormones, reduces appetite & decreases sugar cravings.",
    relatedGoals: [
      "Build muscle & lose fat",
      "Increase energy & reduce fatigue"
    ],
    relatedSymptoms: [
      "Low energy",
      "Low motivation"
    ],
    shortDescription: "26+ year, doctor formulated, herbal solution that helps increases your fat-burning hormones, boosts your metabolism, reduces appetite & burns belly fat.",
    productUrl: "https://healthfitnesslongevity.com/lo/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/lo/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Perfect Vitamin D3 + K2",
    category: "Vitamin D+K; Immune Support, Bone Health, Energy & Mood",
    primaryBenefits: "Increase Vitamin D levels, boost immune system, increase testosterone, increase energy levels, & improve mood + happiness.",
    relatedGoals: [
      "Optimize testosterone",
      "Increase energy & reduce fatigue",
      "Improve mood & mental clarity",
      "Better sleep & recovery"
    ],
    relatedSymptoms: [
      "Low energy",
      "Reduced libido",
      "Brain fog",
      "Low motivation",
      "Poor sleep"
    ],
    shortDescription: "12+ year, doctor formulated, plant-based formula of the most absorbable & bioavailable forms of Vitamin D3 + K2. Maximum science-backed dose.",
    productUrl: "https://healthfitnesslongevity.com/perfect-vitamin-dk/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/vdk/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "ProVanax",
    category: "Mood, Worry, Anxiety, Panic, Mental Well-Being, Happiness, Relaxation, Sleep",
    primaryBenefits: "Improve serotonin, GABA, dopamine and neurotransmitters. Enhance mood, decrease anxiety, worry and sadness. Improves sleep.",
    relatedGoals: [
      "Improve mood & mental clarity",
      "Better sleep & recovery",
      "Increase energy & reduce fatigue"
    ],
    relatedSymptoms: [
      "Poor sleep",
      "Brain fog",
      "Low motivation",
      "Mood swings"
    ],
    shortDescription: "26+ year, doctor formulated, herbal solution to helps reduce anxiety & worry, while improving mood & happiness. Optimizes serotonin, dopamine & GABA.",
    productUrl: "https://healthfitnesslongevity.com/provanax/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/pv/slider/bottle-thumb.webp",
    forGender: "Both"
  },
  {
    name: "Stress & Cortisol Relief",
    category: "Stress, Cortisol & Adrenal Support, Muscle, Fat Loss, Sleep",
    primaryBenefits: "Lowers stress + cortisol. Strengthens adrenal glands. Increases testosterone.",
    relatedGoals: [
      "Optimize testosterone",
      "Better sleep & recovery",
      "Increase energy & reduce fatigue",
      "Build muscle & lose fat",
      "Improve mood & mental clarity"
    ],
    relatedSymptoms: [
      "Poor sleep",
      "Low energy",
      "Low motivation",
      "Mood swings"
    ],
    shortDescription: "12+ year, doctor formulated, herbal solution that helps reduce stress hormones, cortisol and improves adrenal function. Important for sleep, muscle building & fat loss.",
    productUrl: "https://healthfitnesslongevity.com/stress-cortisol-relief/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/scr/slider/bottle-thumb.webp",
    forGender: "Both"
  }
];

// Get recommended products based on user profile
export function getRecommendedProducts(
  goals: string[],
  symptoms: string[],
  biologicalSex: string,
  limit: number = 3
): Product[] {
  const genderFilter = biologicalSex === "female" ? ["Female", "Both"] : ["Male", "Both"];
  
  const scoredProducts = products
    .filter(p => genderFilter.includes(p.forGender))
    .map(product => {
      let score = 0;
      
      // Score based on goal matches (weight: 3)
      goals.forEach(goal => {
        if (product.relatedGoals.some(g => 
          g.toLowerCase().includes(goal.toLowerCase()) || 
          goal.toLowerCase().includes(g.toLowerCase())
        )) {
          score += 3;
        }
      });
      
      // Score based on symptom matches (weight: 2)
      symptoms.forEach(symptom => {
        if (product.relatedSymptoms.some(s => 
          s.toLowerCase().includes(symptom.toLowerCase()) || 
          symptom.toLowerCase().includes(s.toLowerCase())
        )) {
          score += 2;
        }
      });
      
      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
  
  return scoredProducts;
}

// Get products for specific symptom scores
export function getProductsForLowScores(
  lowScoreAreas: string[],
  biologicalSex: string,
  limit: number = 2
): Product[] {
  const genderFilter = biologicalSex === "female" ? ["Female", "Both"] : ["Male", "Both"];
  
  const areaToSymptomMap: Record<string, string[]> = {
    energy: ["Low energy", "Low motivation"],
    mood: ["Mood swings", "Low motivation"],
    sleep: ["Poor sleep"],
    mentalClarity: ["Brain fog"],
    libido: ["Reduced libido", "Erectile dysfunction"],
    performance: ["Low energy", "Low motivation"]
  };
  
  const relevantSymptoms = lowScoreAreas.flatMap(area => areaToSymptomMap[area] || []);
  
  const scoredProducts = products
    .filter(p => genderFilter.includes(p.forGender))
    .map(product => {
      let score = 0;
      relevantSymptoms.forEach(symptom => {
        if (product.relatedSymptoms.some(s => 
          s.toLowerCase().includes(symptom.toLowerCase())
        )) {
          score += 2;
        }
      });
      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
  
  return scoredProducts;
}
