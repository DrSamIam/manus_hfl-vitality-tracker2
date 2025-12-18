import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface BiomarkerInfo {
  name: string;
  description: string;
  whyItMatters: string;
  optimalRange: { male: string; female: string };
  symptoms: { low: string[]; high: string[] };
  improvementTips: string[];
  testingFrequency: string;
  relatedMarkers: string[];
}

const BIOMARKER_EDUCATION: Record<string, BiomarkerInfo> = {
  "Testosterone (Total)": {
    name: "Testosterone",
    description: "The primary male sex hormone, also important for women in smaller amounts. It plays a crucial role in muscle mass, bone density, fat distribution, and overall vitality.",
    whyItMatters: "Testosterone affects energy levels, mood, libido, muscle strength, and cognitive function. Optimal levels are associated with better cardiovascular health and longevity.",
    optimalRange: {
      male: "500-900 ng/dL (optimal), 300-1100 ng/dL (normal)",
      female: "25-70 ng/dL (optimal), 15-100 ng/dL (normal)",
    },
    symptoms: {
      low: ["Fatigue and low energy", "Decreased libido", "Muscle weakness", "Brain fog", "Depression or irritability", "Weight gain (especially belly fat)"],
      high: ["Acne or oily skin", "Hair loss", "Aggression or mood swings", "Sleep problems", "In women: irregular periods, excess body hair"],
    },
    improvementTips: [
      "Get 7-9 hours of quality sleep",
      "Lift heavy weights and do compound exercises",
      "Maintain a healthy body fat percentage (10-20% for men)",
      "Reduce chronic stress and cortisol",
      "Eat adequate protein and healthy fats",
      "Consider vitamin D and zinc supplementation if deficient",
      "Limit alcohol consumption",
    ],
    testingFrequency: "Every 3-6 months when optimizing, annually once stable",
    relatedMarkers: ["Free Testosterone", "SHBG", "Estradiol", "LH", "FSH"],
  },
  "Estradiol (E2)": {
    name: "Estradiol",
    description: "The most potent form of estrogen. Essential for reproductive health in women and important for bone health, brain function, and cardiovascular health in both sexes.",
    whyItMatters: "Proper estrogen balance affects mood, bone density, skin health, and cognitive function. In men, some estradiol is necessary but too much can cause issues.",
    optimalRange: {
      male: "20-40 pg/mL (optimal), 10-60 pg/mL (normal)",
      female: "50-200 pg/mL (varies by cycle phase)",
    },
    symptoms: {
      low: ["Hot flashes", "Vaginal dryness (women)", "Bone loss", "Mood changes", "Dry skin", "Joint pain"],
      high: ["Water retention", "Breast tenderness", "Mood swings", "Weight gain", "In men: gynecomastia, erectile dysfunction"],
    },
    improvementTips: [
      "Maintain healthy body composition",
      "Eat cruciferous vegetables (broccoli, cauliflower)",
      "Support liver health for proper estrogen metabolism",
      "Limit exposure to xenoestrogens (plastics, pesticides)",
      "Consider DIM or calcium d-glucarate supplements",
      "Exercise regularly to improve hormone balance",
    ],
    testingFrequency: "Every 3-6 months, women should test on day 3 of cycle for baseline",
    relatedMarkers: ["Testosterone", "Progesterone", "SHBG", "FSH"],
  },
  "Cortisol": {
    name: "Cortisol",
    description: "The primary stress hormone produced by the adrenal glands. It regulates metabolism, immune response, and helps the body respond to stress.",
    whyItMatters: "Chronic high cortisol can lead to weight gain, muscle loss, poor sleep, and immune suppression. Low cortisol can cause fatigue and inability to handle stress.",
    optimalRange: {
      male: "10-20 μg/dL (morning), varies throughout day",
      female: "10-20 μg/dL (morning), varies throughout day",
    },
    symptoms: {
      low: ["Extreme fatigue", "Difficulty waking up", "Salt cravings", "Low blood pressure", "Dizziness when standing"],
      high: ["Difficulty sleeping", "Anxiety", "Weight gain (especially face and belly)", "High blood sugar", "Muscle weakness", "Thin skin and bruising"],
    },
    improvementTips: [
      "Practice stress management (meditation, deep breathing)",
      "Maintain consistent sleep schedule",
      "Avoid caffeine after noon",
      "Exercise moderately (avoid overtraining)",
      "Consider adaptogenic herbs (ashwagandha, rhodiola)",
      "Spend time in nature",
      "Limit blue light exposure at night",
    ],
    testingFrequency: "Morning cortisol or 4-point saliva test for full picture",
    relatedMarkers: ["DHEA-S", "Testosterone", "Thyroid hormones"],
  },
  "TSH (Thyroid Stimulating Hormone)": {
    name: "TSH",
    description: "A hormone produced by the pituitary gland that signals the thyroid to produce T3 and T4. It's the primary screening test for thyroid function.",
    whyItMatters: "Thyroid hormones regulate metabolism, energy, body temperature, and affect nearly every organ system. Optimal thyroid function is crucial for overall health.",
    optimalRange: {
      male: "1.0-2.5 mIU/L (optimal), 0.3-4.5 mIU/L (normal)",
      female: "1.0-2.5 mIU/L (optimal), 0.3-4.5 mIU/L (normal)",
    },
    symptoms: {
      low: ["Anxiety", "Rapid heart rate", "Weight loss", "Heat intolerance", "Tremors", "Insomnia"],
      high: ["Fatigue", "Weight gain", "Cold intolerance", "Constipation", "Dry skin", "Hair loss", "Depression"],
    },
    improvementTips: [
      "Ensure adequate iodine intake (but not excessive)",
      "Get enough selenium (Brazil nuts, fish)",
      "Support gut health for T4 to T3 conversion",
      "Manage stress (affects thyroid function)",
      "Avoid goitrogens in excess (raw cruciferous vegetables)",
      "Check for and address nutrient deficiencies",
    ],
    testingFrequency: "Every 6-12 months, more frequently if optimizing",
    relatedMarkers: ["Free T4", "Free T3", "Reverse T3", "Thyroid antibodies"],
  },
  "Vitamin D": {
    name: "Vitamin D",
    description: "A fat-soluble vitamin that functions as a hormone. Essential for bone health, immune function, mood regulation, and hundreds of bodily processes.",
    whyItMatters: "Vitamin D deficiency is linked to increased risk of many diseases, poor immune function, depression, and muscle weakness. Most people are deficient.",
    optimalRange: {
      male: "40-80 ng/mL (optimal), 30-100 ng/mL (normal)",
      female: "40-80 ng/mL (optimal), 30-100 ng/mL (normal)",
    },
    symptoms: {
      low: ["Fatigue", "Bone pain", "Muscle weakness", "Depression", "Frequent illness", "Slow wound healing"],
      high: ["Nausea", "Vomiting", "Weakness", "Kidney problems", "Calcium buildup"],
    },
    improvementTips: [
      "Get 15-30 minutes of midday sun exposure",
      "Supplement with D3 (not D2) if needed",
      "Take vitamin D with fat for better absorption",
      "Consider K2 supplementation alongside D3",
      "Eat fatty fish, egg yolks, and fortified foods",
      "Test levels before and after supplementation",
    ],
    testingFrequency: "Every 3-6 months when optimizing, annually once stable",
    relatedMarkers: ["Calcium", "PTH", "Magnesium"],
  },
  "Vitamin B12": {
    name: "Vitamin B12",
    description: "An essential vitamin for nerve function, DNA synthesis, and red blood cell formation. It's only found naturally in animal products.",
    whyItMatters: "B12 deficiency can cause irreversible neurological damage if left untreated. It's common in vegetarians, vegans, and older adults.",
    optimalRange: {
      male: "500-900 pg/mL (optimal), 200-1200 pg/mL (normal)",
      female: "500-900 pg/mL (optimal), 200-1200 pg/mL (normal)",
    },
    symptoms: {
      low: ["Fatigue", "Weakness", "Numbness or tingling", "Memory problems", "Balance issues", "Pale skin", "Mood changes"],
      high: ["Generally not toxic, but very high levels may indicate liver disease or certain cancers"],
    },
    improvementTips: [
      "Eat B12-rich foods (meat, fish, eggs, dairy)",
      "Consider methylcobalamin or adenosylcobalamin supplements",
      "If deficient, may need injections initially",
      "Check for pernicious anemia or absorption issues",
      "Vegans should supplement consistently",
      "Avoid proton pump inhibitors if possible (reduce absorption)",
    ],
    testingFrequency: "Annually, more often if supplementing or deficient",
    relatedMarkers: ["Folate", "Homocysteine", "MMA (methylmalonic acid)"],
  },
};

interface BiomarkerEducationCardProps {
  markerName: string;
  sex: "male" | "female";
  currentValue?: number;
}

export function BiomarkerEducationCard({ markerName, sex, currentValue }: BiomarkerEducationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [expanded, setExpanded] = useState(false);

  const info = BIOMARKER_EDUCATION[markerName];
  if (!info) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={{ fontSize: 24 }}>📚</ThemedText>
          <View>
            <ThemedText type="defaultSemiBold">Learn about {info.name}</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
              Tap to {expanded ? "collapse" : "expand"}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={{ fontSize: 20 }}>{expanded ? "▲" : "▼"}</ThemedText>
      </Pressable>

      {expanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Description */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              What is {info.name}?
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary, lineHeight: 22 }}>
              {info.description}
            </ThemedText>
          </View>

          {/* Why It Matters */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Why It Matters
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary, lineHeight: 22 }}>
              {info.whyItMatters}
            </ThemedText>
          </View>

          {/* Optimal Range */}
          <View style={[styles.rangeCard, { backgroundColor: colors.tint + "15" }]}>
            <ThemedText type="defaultSemiBold">Optimal Range ({sex === "male" ? "Men" : "Women"})</ThemedText>
            <ThemedText style={{ color: colors.tint, marginTop: 4 }}>
              {info.optimalRange[sex]}
            </ThemedText>
          </View>

          {/* Symptoms */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Signs of Imbalance
            </ThemedText>
            
            <View style={[styles.symptomBox, { backgroundColor: colors.warning + "15" }]}>
              <ThemedText type="defaultSemiBold" style={{ color: colors.warning }}>
                Low Levels May Cause:
              </ThemedText>
              {info.symptoms.low.map((symptom, index) => (
                <ThemedText key={index} style={{ color: colors.textSecondary, marginTop: 4 }}>
                  • {symptom}
                </ThemedText>
              ))}
            </View>

            <View style={[styles.symptomBox, { backgroundColor: colors.error + "15", marginTop: 12 }]}>
              <ThemedText type="defaultSemiBold" style={{ color: colors.error }}>
                High Levels May Cause:
              </ThemedText>
              {info.symptoms.high.map((symptom, index) => (
                <ThemedText key={index} style={{ color: colors.textSecondary, marginTop: 4 }}>
                  • {symptom}
                </ThemedText>
              ))}
            </View>
          </View>

          {/* Improvement Tips */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              💡 How to Optimize
            </ThemedText>
            {info.improvementTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <ThemedText style={{ color: colors.success }}>✓</ThemedText>
                <ThemedText style={{ color: colors.textSecondary, flex: 1, lineHeight: 20 }}>
                  {tip}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Testing Frequency */}
          <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText style={{ fontSize: 16 }}>🔬</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">Testing Frequency</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
                {info.testingFrequency}
              </ThemedText>
            </View>
          </View>

          {/* Related Markers */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Related Markers to Consider
            </ThemedText>
            <View style={styles.tagContainer}>
              {info.relatedMarkers.map((marker, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.tint + "20" }]}>
                  <ThemedText style={{ color: colors.tint, fontSize: 12 }}>{marker}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  rangeCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  symptomBox: {
    padding: 12,
    borderRadius: 12,
  },
  tipItem: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
});

export { BIOMARKER_EDUCATION };
