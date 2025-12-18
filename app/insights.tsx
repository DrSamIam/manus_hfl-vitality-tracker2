import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AchievementsGrid, calculateAchievements } from "@/components/achievements";
import { CorrelationAnalysis } from "@/components/correlation-analysis";
import { WeeklySummary } from "@/components/weekly-summary";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: insights, isLoading } = trpc.insights.list.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );
  const { data: symptoms } = trpc.symptoms.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: biomarkers } = trpc.biomarkers.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: supplements } = trpc.supplements.list.useQuery({}, { enabled: isAuthenticated });
  const { data: cycles } = trpc.cycles.list.useQuery(undefined, { enabled: isAuthenticated && profile?.biologicalSex === "female" });

  // Calculate achievements
  const achievements = calculateAchievements({
    streak: 0, // Would calculate from symptoms
    biomarkersCount: biomarkers?.length || 0,
    uniqueBiomarkers: new Set(biomarkers?.map((b) => b.markerName)).size || 0,
    supplementsCount: supplements?.length || 0,
    perfectAdherenceDays: 0, // Would need to calculate from logs
    cyclesTracked: cycles?.length || 0,
    profileComplete: !!profile?.biologicalSex && !!profile?.age,
    hasViewedInsights: true,
    hasExportedData: false,
  });

  // Generate pattern insights based on data
  const generatePatternInsights = () => {
    const patterns: { title: string; description: string; type: "positive" | "negative" | "neutral" }[] = [];
    
    if (symptoms && symptoms.length >= 7) {
      const recentEnergy = symptoms.slice(0, 3).reduce((sum, s) => sum + (s.energy || 0), 0) / 3;
      const olderEnergy = symptoms.slice(4, 7).reduce((sum, s) => sum + (s.energy || 0), 0) / 3;
      
      if (recentEnergy > olderEnergy + 1) {
        patterns.push({
          title: "Energy Improving",
          description: "Your energy levels have been trending upward over the past week.",
          type: "positive",
        });
      } else if (recentEnergy < olderEnergy - 1) {
        patterns.push({
          title: "Energy Declining",
          description: "Your energy levels have been lower recently. Consider reviewing your sleep and supplement routine.",
          type: "negative",
        });
      }
    }

    if (biomarkers && biomarkers.length > 0) {
      patterns.push({
        title: "Lab Data Available",
        description: `You have ${biomarkers.length} biomarker result${biomarkers.length > 1 ? "s" : ""} tracked. Keep adding results to see trends.`,
        type: "neutral",
      });
    }

    return patterns;
  };

  const patterns = generatePatternInsights();

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Please log in to view insights</ThemedText>
      </ThemedView>
    );
  }

  // Format symptoms for components
  const formattedSymptoms = (symptoms || []).map((s) => ({
    logDate: s.logDate as unknown as string,
    energy: s.energy,
    mood: s.mood,
    sleep: s.sleep,
    mentalClarity: s.mentalClarity,
    libido: s.libido,
    performanceStamina: s.performanceStamina,
  }));

  // Format supplements for correlation analysis
  const formattedSupplements = (supplements || []).map((s) => ({
    id: s.id,
    name: s.name,
    startDate: s.startDate as unknown as string,
  }));

  const formattedSupplementLogs: Array<{
    supplementId: number;
    supplementName: string;
    logDate: string;
    amTaken: boolean;
    pmTaken: boolean;
  }> = [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20) + 80,
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={{ color: colors.tint }}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title">Insights</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            AI-Powered Health Patterns
          </ThemedText>
        </View>

        {/* Weekly Summary */}
        <WeeklySummary symptoms={formattedSymptoms} />

        {/* Achievements */}
        <AchievementsGrid achievements={achievements} showLocked={true} />

        {/* Supplement Correlation Analysis */}
        {supplements && supplements.length > 0 && (
          <CorrelationAnalysis
            symptoms={formattedSymptoms}
            supplements={formattedSupplements}
            supplementLogs={formattedSupplementLogs}
          />
        )}

        {/* Pattern Insights */}
        {patterns.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Detected Patterns
            </ThemedText>
            {patterns.map((pattern, index) => (
              <View
                key={index}
                style={[
                  styles.patternCard,
                  {
                    backgroundColor: colors.surface,
                    borderLeftColor:
                      pattern.type === "positive"
                        ? colors.success
                        : pattern.type === "negative"
                          ? colors.error
                          : colors.tint,
                  },
                ]}
              >
                <ThemedText type="defaultSemiBold">{pattern.title}</ThemedText>
                <ThemedText style={{ color: colors.textSecondary, marginTop: 4 }}>
                  {pattern.description}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* AI Insights */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            AI Insights
          </ThemedText>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.tint} />
          ) : insights && insights.length > 0 ? (
            insights.map((insight) => (
              <View
                key={insight.id}
                style={[styles.insightCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.insightHeader}>
                  <ThemedText style={{ fontSize: 24 }}>💡</ThemedText>
                  <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {new Date(insight.generatedDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                <ThemedText style={{ marginTop: 8 }}>{insight.insightText}</ThemedText>
                {insight.dataSource && (
                  <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                    Based on: {insight.dataSource}
                  </ThemedText>
                )}
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>🧠</ThemedText>
              <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
                Building Your Insights
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Keep logging your symptoms and biomarkers. The more data you provide, the better insights we can generate about your health patterns.
              </ThemedText>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Health Tips
          </ThemedText>
          <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 24, marginBottom: 8 }}>💊</ThemedText>
            <ThemedText type="defaultSemiBold">Consistency is Key</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, marginTop: 4 }}>
              Log your symptoms daily at the same time for the most accurate pattern detection.
            </ThemedText>
          </View>
          <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 24, marginBottom: 8 }}>🔬</ThemedText>
            <ThemedText type="defaultSemiBold">Regular Lab Work</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, marginTop: 4 }}>
              Get comprehensive hormone panels every 3-6 months to track your progress.
            </ThemedText>
          </View>
          {profile?.biologicalSex === "female" && profile?.cycleTrackingEnabled && (
            <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ fontSize: 24, marginBottom: 8 }}>🌸</ThemedText>
              <ThemedText type="defaultSemiBold">Cycle-Aware Testing</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, marginTop: 4 }}>
                For the most accurate hormone results, test on day 3 of your cycle for FSH/LH and day 21 for progesterone.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { marginBottom: 24 },
  backButton: { marginBottom: 16 },
  subtitle: { fontSize: 16, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 16 },
  patternCard: { padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4 },
  insightCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  insightHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  emptyState: { padding: 40, borderRadius: 16, alignItems: "center" },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  tipCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
});
