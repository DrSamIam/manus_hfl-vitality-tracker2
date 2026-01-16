// HFL Product Catalog Data
// Auto-generated from HFLProductDetails(Manus).xlsx

export interface HFLProduct {
  id: string;
  name: string;
  category: string;
  primaryBenefits: string;
  relatedGoals: string;
  relatedSymptoms: string;
  shortDescription: string;
  productUrl: string;
  imageUrl: string;
  forGender: "Male" | "Female" | "Both";
  // Parsed arrays for matching
  symptomKeywords: string[];
  goalKeywords: string[];
  categoryKeywords: string[];
}

export const HFL_PRODUCTS: HFLProduct[] = [
  {
    id: "alphaviril",
    name: "AlphaViril",
    category: "Testosterone, Hormones, Energy, Libido, Erections, Muscle Growth",
    primaryBenefits: "Boosts testosterone & optimizes \"youth\" hormones (estrogen, DHT, dopamine & Cortisol)",
    relatedGoals: "Improve libido, sex drive, muscle growth, energy, & erections",
    relatedSymptoms: "Low libido, erectile problems, small/weak muscles, low drive & motivation, low energy.",
    shortDescription: "26+ year, doctor formulated, natural solution for boosting testosterone, optimizing hormones, improving sex drive & promoting harder erections.",
    productUrl: "https://healthfitnesslongevity.com/alphaviril/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/av/slider/bottle-thumb.webp",
    forGender: "Male",
    symptomKeywords: ["low libido", "erectile", "weak muscles", "low drive", "low motivation", "low energy", "fatigue"],
    goalKeywords: ["libido", "sex drive", "muscle growth", "energy", "erections", "testosterone"],
    categoryKeywords: ["testosterone", "hormones", "energy", "libido", "erections", "muscle"],
  },
  {
    id: "body-brain-energy",
    name: "Body-Brain Energy",
    category: "Physical Energy, Mental Focus, Memory, Nootropic, Brain Health, Anti-Aging",
    primaryBenefits: "Increases energy, mental performance, focus & memory. Anti-aging benefits.",
    relatedGoals: "Increase energy, improve memory, focus & mood",
    relatedSymptoms: "Low energy, fatigue, memory loss, low drive, brain fog, ADHD",
    shortDescription: "22+ year, doctor formulated, nootropic herbal solution that increases physical energy, improves mental performance & memory.",
    productUrl: "https://healthfitnesslongevity.com/body-brain-energy/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bbe/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["low energy", "fatigue", "memory loss", "low drive", "brain fog", "adhd", "mental clarity"],
    goalKeywords: ["energy", "memory", "focus", "mood", "mental performance"],
    categoryKeywords: ["energy", "focus", "memory", "nootropic", "brain health", "anti-aging"],
  },
  {
    id: "blood-flow-optimizer",
    name: "Blood Flow Optimizer",
    category: "Blood Flow & Circulation, Arterial Health",
    primaryBenefits: "Nitric oxide booster, improving blood flow & blood vessel strength.",
    relatedGoals: "Increase circulation to brain, heart, hands, feet, penis, muscle and skin/hair.",
    relatedSymptoms: "Erectile problems, cold hands & feet, heart problems, high cholesterol & blood pressure, poor focus & memory.",
    shortDescription: "21+ year, doctor formulated, herbal solution that helps promote youthful blood flow & circulation to your organs, brain, skin, hair & extremeties.",
    productUrl: "https://healthfitnesslongevity.com/blood-flow-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bfo/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["erectile", "cold hands", "cold feet", "heart problems", "high cholesterol", "high blood pressure", "poor focus", "poor memory"],
    goalKeywords: ["circulation", "blood flow", "heart health", "brain health"],
    categoryKeywords: ["blood flow", "circulation", "arterial health", "nitric oxide"],
  },
  {
    id: "blood-pressure-optimizer",
    name: "Blood Pressure Optimizer",
    category: "Blood Pressure & Kidney Health",
    primaryBenefits: "Lowers blood pressure, improves heart, kidney & brain function.",
    relatedGoals: "Lower blood pressure, improve heart, brain & kidney function. Relax, dilate & strengthen blood vessels",
    relatedSymptoms: "High blood pressure, head aches, erectile problems.",
    shortDescription: "21+ year, doctor formulated, herbal solution that helps promote healthy blood pressure, improving heart, kidney & brain health.",
    productUrl: "https://healthfitnesslongevity.com/blood-pressure-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bpo/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["high blood pressure", "headaches", "head aches", "erectile"],
    goalKeywords: ["blood pressure", "heart health", "kidney health", "brain health"],
    categoryKeywords: ["blood pressure", "kidney health", "heart health"],
  },
  {
    id: "blood-sugar-optimizer",
    name: "Blood Sugar Optimizer",
    category: "Blood Sugar Control, Insulin Sensitivity & Carb Metabolism",
    primaryBenefits: "Lowers blood sugar, A1c & insulin levels. Reduces sugar cravings & improves carbohydrate metabolism.",
    relatedGoals: "More energy, stable blood sugar, weight loss, brain and heart health, anti-aging, lower blood pressure.",
    relatedSymptoms: "High blood sugar, insulin & A1C levels. Fatigue, lack of focus, high blood pressure, weight gain, belly fat.",
    shortDescription: "24+ year, doctor formulated, herbal solution that helps lower blood sugar, improves GLP-1 & reduces sugar cravings.",
    productUrl: "https://healthfitnesslongevity.com/blood-sugar-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/bso/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["high blood sugar", "high insulin", "high a1c", "fatigue", "lack of focus", "high blood pressure", "weight gain", "belly fat", "sugar cravings"],
    goalKeywords: ["blood sugar", "weight loss", "energy", "anti-aging", "insulin sensitivity"],
    categoryKeywords: ["blood sugar", "insulin", "carb metabolism", "glp-1"],
  },
  {
    id: "cholesterol-optimizer",
    name: "Cholesterol Optimizer",
    category: "Healthy Cholesterol, HDL/LDL, Triglycerides & Homocysteine",
    primaryBenefits: "Lowers cholesterol, improves HDL/LDL, lowers triglycerides & homocysteine levels.",
    relatedGoals: "Heart and brain health, healthy lipid levels, anti-aging, lower blood pressure.",
    relatedSymptoms: "High cholesterol, LDL, triglycerides & homocysteine.",
    shortDescription: "26+ year, doctor formulated, herbal solution that helps lower cholesterol, balance HDL/LDL levels and improves triglycerides + homocysteine.",
    productUrl: "https://healthfitnesslongevity.com/cholesterol-optimizer/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/co/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["high cholesterol", "high ldl", "high triglycerides", "high homocysteine"],
    goalKeywords: ["cholesterol", "heart health", "brain health", "lipid levels", "anti-aging"],
    categoryKeywords: ["cholesterol", "hdl", "ldl", "triglycerides", "homocysteine"],
  },
  {
    id: "deep-sleep-formula",
    name: "Deep Sleep Formula",
    category: "Deeper, Quality, Restorative & Youthful Sleep",
    primaryBenefits: "Improves sleep quality & duration. Helps you fall asleep faster & stay asleep longer.",
    relatedGoals: "Sleep, energy, anti-aging, weight loss, better mood, lower blood sugar & pressure, lower cortisol levels, higher testosterone.",
    relatedSymptoms: "Fatigue, brain fog, high blood sugar, blood pressure, cortisol levels, lower testosterone, erectile problems, memory loss.",
    shortDescription: "A 14+ year, doctor formulated, herbal solution to helps you fall asleep faster & stay asleep longer. Relaxes the body & mind. No grogginess, wake up refreshed.",
    productUrl: "https://healthfitnesslongevity.com/deep-sleep-formula/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/dsf/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["fatigue", "brain fog", "high blood sugar", "high blood pressure", "high cortisol", "low testosterone", "erectile", "memory loss", "insomnia", "poor sleep", "sleep problems"],
    goalKeywords: ["sleep", "energy", "anti-aging", "weight loss", "mood", "cortisol", "testosterone"],
    categoryKeywords: ["sleep", "restorative", "relaxation"],
  },
  {
    id: "inflame-pain-relief",
    name: "Inflame & Pain Relief",
    category: "Inflammation & Pain; Immune + Joint Support",
    primaryBenefits: "Lowers inflammation, reduces pain, improves joint mobility & flexibility, gut health & immune function.",
    relatedGoals: "Reduces pain & inflammation. Improves joint health, flexibility & mobility. Improves gut health & bacteria. Boosts immune system.",
    relatedSymptoms: "Pain, low flexibility, gut problems, brain fog, low immune system.",
    shortDescription: "17+ year, doctor formulated, herbal solution that helps reduce pain & inflammation, promoting healthy joint, brain & immune function.",
    productUrl: "https://healthfitnesslongevity.com/inflame-pain-relief/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/ipr/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["pain", "low flexibility", "gut problems", "brain fog", "low immune", "inflammation", "joint pain"],
    goalKeywords: ["pain relief", "inflammation", "joint health", "flexibility", "mobility", "gut health", "immune system"],
    categoryKeywords: ["inflammation", "pain", "immune", "joint support"],
  },
  {
    id: "lean-optimizer",
    name: "Lean Optimizer",
    category: "Weight Loss, Appetite Suppression & Faster Metabolism",
    primaryBenefits: "Weight loss, increases fat-burning hormones, reduces appetite & decreases sugar cravings.",
    relatedGoals: "Improves youthful fat-burning hormones, increases fat loss, decreases belly-fat, increases metabolism & decreases appetite + cravings.",
    relatedSymptoms: "Slow metabolism, over weight, low thyroid, fatigue, sugar cravings.",
    shortDescription: "26+ year, doctor formulated, herbal solution that helps increases your fat-burning hormones, boosts your metabolism, reduces appetite & burns belly fat.",
    productUrl: "https://healthfitnesslongevity.com/lo/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/lo/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["slow metabolism", "overweight", "weight gain", "low thyroid", "fatigue", "sugar cravings", "belly fat"],
    goalKeywords: ["weight loss", "fat loss", "metabolism", "appetite control", "belly fat"],
    categoryKeywords: ["weight loss", "appetite suppression", "metabolism", "fat burning"],
  },
  {
    id: "perfect-vitamin-d3-k2",
    name: "Perfect Vitamin D3 + K2",
    category: "Vitamin D+K; Immune Support, Bone Health, Energy & Mood",
    primaryBenefits: "Increase Vitamin D levels, boost immune system, increase testosterone, increase energy levels, & improve mood + happiness.",
    relatedGoals: "Increase Vitamin D, immune system, energy, testosterone, improve mood.",
    relatedSymptoms: "Fatigue, brain fog, low testosterone + libido, high blood sugar + pressure, accelerated aging, hair loss, wrinkles.",
    shortDescription: "12+ year, doctor formulated, plant-based formula of the most absorbable & bioavailable forms of Vitamin D3 + K2. Maximum science-backed dose.",
    productUrl: "https://healthfitnesslongevity.com/perfect-vitamin-dk/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/vdk/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["fatigue", "brain fog", "low testosterone", "low libido", "high blood sugar", "high blood pressure", "aging", "hair loss", "wrinkles"],
    goalKeywords: ["vitamin d", "immune system", "energy", "testosterone", "mood", "bone health"],
    categoryKeywords: ["vitamin d", "vitamin k", "immune support", "bone health", "energy", "mood"],
  },
  {
    id: "provanax",
    name: "ProVanax",
    category: "Mood, Worry, Anxiety, Panic, Mental Well-Being, Happiness, Relaxation, Sleep",
    primaryBenefits: "Improve serotonin, GABA, dopamine and neurotransmitters. Enhance mood, decrease anxiety, worry and sadness. Improves sleep",
    relatedGoals: "Improve mood, reduces worry, sadness and anxiety. Improve serotonin, GABA & dopamine",
    relatedSymptoms: "Anxiety, worry, stress, poor sleep, OCD, ADHD.",
    shortDescription: "26+ year, doctor formulated, herbal solution to helps reduce anxiety & worry, while improving mood & happiness. Optimizes serotonin, dopamine & GABA.",
    productUrl: "https://healthfitnesslongevity.com/provanax/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/pv/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["anxiety", "worry", "stress", "poor sleep", "ocd", "adhd", "sadness", "depression", "mood swings"],
    goalKeywords: ["mood", "anxiety relief", "happiness", "relaxation", "sleep", "serotonin", "dopamine", "gaba"],
    categoryKeywords: ["mood", "anxiety", "mental well-being", "happiness", "relaxation", "sleep"],
  },
  {
    id: "stress-cortisol-relief",
    name: "Stress & Cortisol Relief",
    category: "Stress, Cortisol & Adrenal Support, Muscle, Fat Loss, Sleep",
    primaryBenefits: "Lowers stress + cortisol. Strengthens adrenal glands. Increases testosterone.",
    relatedGoals: "Lowering stress hormones, improves youth hormones, resulting in slower aging, improved skin and hair, better sleep, more muscles and less body fat.",
    relatedSymptoms: "Fatigue, stress, anger, poor sleep/insomnia, fat gain, belly fat, lower testosterone, anxiety, high blood sugar + pressure.",
    shortDescription: "12+ year, doctor formulated, herbal solution that helps reduce stress hormones, cortisol and improves adrenal function. Important for sleep, muscle building & fat loss.",
    productUrl: "https://healthfitnesslongevity.com/stress-cortisol-relief/?coupon=fk-cpn-43p&a=app&utm_source=app&utm_medium=link&utm_campaign=vitality-tracker",
    imageUrl: "https://hfl.s3.dualstack.us-east-1.amazonaws.com/images/_products/scr/slider/bottle-thumb.webp",
    forGender: "Both",
    symptomKeywords: ["fatigue", "stress", "anger", "poor sleep", "insomnia", "fat gain", "belly fat", "low testosterone", "anxiety", "high blood sugar", "high blood pressure"],
    goalKeywords: ["stress relief", "cortisol", "adrenal support", "sleep", "muscle building", "fat loss", "testosterone"],
    categoryKeywords: ["stress", "cortisol", "adrenal support", "muscle", "fat loss", "sleep"],
  },
];

// Helper function to get products for a specific gender
export function getProductsForGender(gender: "male" | "female" | "both"): HFLProduct[] {
  return HFL_PRODUCTS.filter(
    (p) => p.forGender === "Both" || p.forGender.toLowerCase() === gender.toLowerCase()
  );
}

// Helper function to match products based on symptoms
export function matchProductsBySymptoms(symptoms: string[], gender: "male" | "female"): HFLProduct[] {
  const genderProducts = getProductsForGender(gender);
  const normalizedSymptoms = symptoms.map((s) => s.toLowerCase());

  return genderProducts
    .map((product) => {
      let score = 0;
      for (const symptom of normalizedSymptoms) {
        for (const keyword of product.symptomKeywords) {
          if (symptom.includes(keyword) || keyword.includes(symptom)) {
            score++;
          }
        }
      }
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}

// Helper function to match products based on goals
export function matchProductsByGoals(goals: string[], gender: "male" | "female"): HFLProduct[] {
  const genderProducts = getProductsForGender(gender);
  const normalizedGoals = goals.map((g) => g.toLowerCase());

  return genderProducts
    .map((product) => {
      let score = 0;
      for (const goal of normalizedGoals) {
        for (const keyword of product.goalKeywords) {
          if (goal.includes(keyword) || keyword.includes(goal)) {
            score++;
          }
        }
      }
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}
