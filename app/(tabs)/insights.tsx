import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { products, getRecommendedProducts } from "@/constants/products";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

interface InsightCard {
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral" | "tip";
  emoji: string;
  relatedProducts?: typeof products;
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: symptoms } = trpc.symptoms.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: biomarkers } = trpc.biomarkers.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: supplements } = trpc.supplements.list.useQuery({}, { enabled: isAuthenticated });

  // Calculate 7-day and 30-day averages
  const averages = useMemo(() => {
    if (!symptoms || symptoms.length === 0) return null;

    const last7 = symptoms.slice(0, 7);
    const last30 = symptoms.slice(0, 30);

    const calcAvg = (data: typeof symptoms, field: keyof typeof symptoms[0]) => {
      const values = data.map((s) => s[field] as number | null).filter((v) => v !== null) as number[];
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    };

    return {
      week: {
        energy: calcAvg(last7, "energy"),
        mood: calcAvg(last7, "mood"),
        sleep: calcAvg(last7, "sleep"),
        mentalClarity: calcAvg(last7, "mentalClarity"),
        libido: calcAvg(last7, "libido"),
        performanceStamina: calcAvg(last7, "performanceStamina"),
      },
      month: {
        energy: calcAvg(last30, "energy"),
        mood: calcAvg(last30, "mood"),
        sleep: calcAvg(last30, "sleep"),
        mentalClarity: calcAvg(last30, "mentalClarity"),
        libido: calcAvg(last30, "libido"),
        performanceStamina: calcAvg(last30, "performanceStamina"),
      },
    };
  }, [symptoms]);

  // Generate insights based on user data
  const insights = useMemo<InsightCard[]>(() => {
    const result: InsightCard[] = [];
    const sex = profile?.biologicalSex || "male";

    if (!averages) {
      result.push({
        title: "Start Tracking!",
        description: "Log your daily symptoms to unlock personalized insights and recommendations.",
        type: "neutral",
        emoji: "📊",
      });
      return result;
    }

    // Energy insights
    if (averages.week.energy && averages.month.energy) {
      const diff = averages.week.energy - averages.month.energy;
      if (diff > 1) {
        result.push({
          title: "Energy Trending Up!",
          description: `Your energy has improved by ${diff.toFixed(1)} points this week compared to your monthly average.`,
          type: "positive",
          emoji: "⚡",
        });
      } else if (diff < -1) {
        result.push({
          title: "Energy Needs Attention",
          description: `Your energy is ${Math.abs(diff).toFixed(1)} points lower this week. Consider reviewing your sleep, stress, and supplement routine.`,
          type: "negative",
          emoji: "🔋",
          relatedProducts: products.filter(
            (p) => p.name === "Body-Brain Energy" || p.name === "Perfect Vitamin D3 + K2"
          ),
        });
      }
    }

    // Sleep insights
    if (averages.week.sleep && averages.week.sleep < 5) {
      result.push({
        title: "Sleep Quality Below Optimal",
        description:
          "Your average sleep quality this week is below 5. Poor sleep can impact energy, mood, and hormone production.",
        type: "negative",
        emoji: "😴",
        relatedProducts: products.filter((p) => p.name === "Deep Sleep Formula"),
      });
    }

    // Mood insights
    if (averages.week.mood && averages.month.mood) {
      const diff = averages.week.mood - averages.month.mood;
      if (diff < -1.5) {
        result.push({
          title: "Mood Dip Detected",
          description:
            "Your mood has been lower than usual this week. Stress management and proper supplementation may help.",
          type: "negative",
          emoji: "😔",
          relatedProducts: products.filter(
            (p) => p.name === "ProVanax" || p.name === "Stress & Cortisol Relief"
          ),
        });
      }
    }

    // Libido insights (sex-specific)
    if (averages.week.libido && averages.week.libido < 4 && sex === "male") {
      result.push({
        title: "Low Libido Detected",
        description:
          "Your libido scores have been low. This could be related to testosterone levels, stress, or sleep quality.",
        type: "negative",
        emoji: "💪",
        relatedProducts: products.filter((p) => p.name === "AlphaViril"),
      });
    }

    // Streak celebration
    if (symptoms && symptoms.length >= 7) {
      result.push({
        title: `${symptoms.length}+ Days of Data! 🔥`,
        description:
          "Amazing consistency! Regular tracking helps you identify patterns and optimize your health.",
        type: "positive",
        emoji: "🔥",
      });
    }

    // Biomarker-based insights
    const lowVitD = biomarkers?.find(
      (b) => b.markerName === "Vitamin D" && parseFloat(b.value) < 50
    );
    if (lowVitD) {
      result.push({
        title: "Vitamin D Needs Attention",
        description: `Your Vitamin D level (${lowVitD.value} ng/mL) is below optimal. Aim for 50-80 ng/mL for best results.`,
        type: "negative",
        emoji: "☀️",
        relatedProducts: products.filter((p) => p.name === "Perfect Vitamin D3 + K2"),
      });
    }

    // Default tip if no other insights
    if (result.length === 0) {
      result.push({
        title: "Keep Tracking!",
        description:
          "Continue logging your symptoms daily to unlock personalized insights and recommendations.",
        type: "neutral",
        emoji: "📈",
      });
    }

    return result;
  }, [averages, profile, symptoms, biomarkers]);

  // Get recommended products
  const topRecommendations = useMemo(() => {
    if (!profile) return [];
    return getRecommendedProducts(
      (profile.goals as string[]) || [],
      (profile.currentSymptoms as string[]) || [],
      profile.biologicalSex || "male",
      4
    );
  }, [profile]);

  const handleProductPress = useCallback((productUrl: string) => {
    Linking.openURL(productUrl);
  }, []);

  const getInsightColors = (type: InsightCard["type"]) => {
    switch (type) {
      case "positive":
        return { bg: "#DCFCE7", border: "#86EFAC", text: "#166534" };
      case "negative":
        return { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B" };
      case "tip":
        return { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" };
      default:
        return { bg: colors.surface, border: colors.border, text: colors.text };
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>💡</ThemedText>
        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
          Insights
        </ThemedText>
        <ThemedText style={{ color: colors.textSecondary, textAlign: "center" }}>
          Please log in to view your personalized insights
        </ThemedText>
      </ThemedView>
    );
  }

  if (profileLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Insights</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, marginTop: 4 }}>
            Personalized recommendations based on your data
          </ThemedText>
        </View>

        {/* 7-Day Summary */}
        {averages && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              7-Day Summary
            </ThemedText>
            <View style={styles.statsGrid}>
              {[
                { label: "Energy", value: averages.week.energy },
                { label: "Mood", value: averages.week.mood },
                { label: "Sleep", value: averages.week.sleep },
                { label: "Clarity", value: averages.week.mentalClarity },
                { label: "Libido", value: averages.week.libido },
                { label: "Stamina", value: averages.week.performanceStamina },
              ].map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.tint }]}>
                    {stat.value?.toFixed(1) || "—"}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {stat.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Insights */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Your Insights
          </ThemedText>
          {insights.map((insight, index) => {
            const insightColors = getInsightColors(insight.type);
            return (
              <View
                key={index}
                style={[
                  styles.insightCard,
                  {
                    backgroundColor: insightColors.bg,
                    borderColor: insightColors.border,
                  },
                ]}
              >
                <View style={styles.insightHeader}>
                  <ThemedText style={{ fontSize: 24 }}>{insight.emoji}</ThemedText>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ color: insightColors.text }}
                    >
                      {insight.title}
                    </ThemedText>
                    <ThemedText style={{ color: insightColors.text, marginTop: 4 }}>
                      {insight.description}
                    </ThemedText>
                  </View>
                </View>

                {insight.relatedProducts && insight.relatedProducts.length > 0 && (
                  <View style={styles.productsContainer}>
                    <ThemedText
                      style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}
                    >
                      Recommended products:
                    </ThemedText>
                    {insight.relatedProducts.map((product) => (
                      <Pressable
                        key={product.name}
                        onPress={() => handleProductPress(product.productUrl)}
                        style={({ pressed }) => [
                          styles.productButton,
                          { backgroundColor: "#FFFFFF", borderColor: colors.border },
                          pressed && styles.buttonPressed,
                        ]}
                      >
                        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
                          {product.name}
                        </ThemedText>
                        <ThemedText style={{ color: colors.textSecondary }}>→</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Top Recommendations */}
        {topRecommendations.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={{ marginBottom: 4 }}>
              Recommended For You
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary, marginBottom: 12 }}>
              Based on your goals and symptoms
            </ThemedText>
            {topRecommendations.map((product) => (
              <Pressable
                key={product.name}
                onPress={() => handleProductPress(product.productUrl)}
                style={({ pressed }) => [
                  styles.recommendationCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && styles.buttonPressed,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{product.name}</ThemedText>
                  <ThemedText style={{ color: colors.tint, fontSize: 13, marginTop: 2 }}>
                    {product.category.split(",")[0]}
                  </ThemedText>
                  <ThemedText
                    style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}
                    numberOfLines={2}
                  >
                    {product.shortDescription}
                  </ThemedText>
                </View>
                <ThemedText style={{ color: colors.textSecondary, fontSize: 20 }}>→</ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center", padding: 20 },
  scrollContent: { padding: 16 },
  header: { marginBottom: 20 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: { marginBottom: 20 },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  productsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  productButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  buttonPressed: { opacity: 0.8 },
});
