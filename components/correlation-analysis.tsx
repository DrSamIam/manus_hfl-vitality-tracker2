import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface SymptomLog {
  logDate: string;
  energy: number | null;
  mood: number | null;
  sleep: number | null;
  mentalClarity: number | null;
  libido: number | null;
  performanceStamina: number | null;
}

interface SupplementLog {
  supplementId: number;
  supplementName: string;
  logDate: string;
  amTaken: boolean;
  pmTaken: boolean;
}

interface Supplement {
  id: number;
  name: string;
  startDate: string;
}

interface CorrelationResult {
  supplementName: string;
  metric: string;
  beforeAvg: number;
  afterAvg: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  dataPoints: number;
}

/**
 * Calculate correlations between supplement usage and symptom changes
 */
export function calculateCorrelations(
  symptoms: SymptomLog[],
  supplements: Supplement[],
  supplementLogs: SupplementLog[]
): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  const metrics = ["energy", "mood", "sleep", "mentalClarity", "libido", "performanceStamina"] as const;
  const metricLabels: Record<string, string> = {
    energy: "Energy",
    mood: "Mood",
    sleep: "Sleep Quality",
    mentalClarity: "Mental Clarity",
    libido: "Libido",
    performanceStamina: "Performance",
  };

  for (const supplement of supplements) {
    const startDate = new Date(supplement.startDate);
    
    // Get symptoms before supplement started (up to 14 days before)
    const beforeSymptoms = symptoms.filter((s) => {
      const logDate = new Date(s.logDate);
      const daysBefore = (startDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysBefore > 0 && daysBefore <= 14;
    });

    // Get symptoms after supplement started (at least 7 days after, up to 30 days)
    const afterSymptoms = symptoms.filter((s) => {
      const logDate = new Date(s.logDate);
      const daysAfter = (logDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAfter >= 7 && daysAfter <= 30;
    });

    // Only calculate if we have enough data
    if (beforeSymptoms.length < 3 || afterSymptoms.length < 3) continue;

    for (const metric of metrics) {
      const beforeValues = beforeSymptoms
        .map((s) => s[metric])
        .filter((v): v is number => v !== null);
      const afterValues = afterSymptoms
        .map((s) => s[metric])
        .filter((v): v is number => v !== null);

      if (beforeValues.length < 3 || afterValues.length < 3) continue;

      const beforeAvg = beforeValues.reduce((a, b) => a + b, 0) / beforeValues.length;
      const afterAvg = afterValues.reduce((a, b) => a + b, 0) / afterValues.length;
      const change = afterAvg - beforeAvg;
      const changePercent = beforeAvg > 0 ? (change / beforeAvg) * 100 : 0;

      // Only include significant changes (>5%)
      if (Math.abs(changePercent) >= 5) {
        results.push({
          supplementName: supplement.name,
          metric: metricLabels[metric],
          beforeAvg: Math.round(beforeAvg * 10) / 10,
          afterAvg: Math.round(afterAvg * 10) / 10,
          change: Math.round(change * 10) / 10,
          changePercent: Math.round(changePercent),
          isPositive: change > 0,
          dataPoints: beforeValues.length + afterValues.length,
        });
      }
    }
  }

  // Sort by absolute change percent (most significant first)
  return results.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}

interface CorrelationCardProps {
  correlation: CorrelationResult;
}

function CorrelationCard({ correlation }: CorrelationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.supplementBadge}>
          <ThemedText style={{ fontSize: 16 }}>💊</ThemedText>
          <ThemedText type="defaultSemiBold">{correlation.supplementName}</ThemedText>
        </View>
        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor: correlation.isPositive ? colors.success + "20" : colors.error + "20",
            },
          ]}
        >
          <ThemedText
            style={{
              color: correlation.isPositive ? colors.success : colors.error,
              fontWeight: "600",
            }}
          >
            {correlation.isPositive ? "+" : ""}
            {correlation.changePercent}%
          </ThemedText>
        </View>
      </View>

      <ThemedText style={{ color: colors.textSecondary, marginBottom: 12 }}>
        Impact on {correlation.metric}
      </ThemedText>

      <View style={styles.comparison}>
        <View style={styles.comparisonItem}>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Before</ThemedText>
          <ThemedText type="title" style={{ fontSize: 20 }}>
            {correlation.beforeAvg}
          </ThemedText>
        </View>
        <View style={styles.arrow}>
          <ThemedText style={{ fontSize: 20, color: correlation.isPositive ? colors.success : colors.error }}>
            {correlation.isPositive ? "→" : "→"}
          </ThemedText>
        </View>
        <View style={styles.comparisonItem}>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>After</ThemedText>
          <ThemedText
            type="title"
            style={{ fontSize: 20, color: correlation.isPositive ? colors.success : colors.error }}
          >
            {correlation.afterAvg}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8 }}>
        Based on {correlation.dataPoints} data points
      </ThemedText>
    </View>
  );
}

interface CorrelationAnalysisProps {
  symptoms: SymptomLog[];
  supplements: Supplement[];
  supplementLogs: SupplementLog[];
}

export function CorrelationAnalysis({ symptoms, supplements, supplementLogs }: CorrelationAnalysisProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const correlations = useMemo(
    () => calculateCorrelations(symptoms, supplements, supplementLogs),
    [symptoms, supplements, supplementLogs]
  );

  const positiveCorrelations = correlations.filter((c) => c.isPositive);
  const negativeCorrelations = correlations.filter((c) => !c.isPositive);

  if (correlations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Supplement Impact Analysis
        </ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={{ fontSize: 40, marginBottom: 12 }}>📊</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, textAlign: "center" }}>
            Keep logging your symptoms and supplements for at least 2 weeks to see how they affect your health metrics.
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle">Supplement Impact Analysis</ThemedText>
        <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
          How your supplements affect your symptoms
        </ThemedText>
      </View>

      {positiveCorrelations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={{ fontSize: 20 }}>📈</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: colors.success }}>
              Positive Effects ({positiveCorrelations.length})
            </ThemedText>
          </View>
          {positiveCorrelations.slice(0, 3).map((correlation, index) => (
            <CorrelationCard key={`pos-${index}`} correlation={correlation} />
          ))}
        </View>
      )}

      {negativeCorrelations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={{ fontSize: 20 }}>📉</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: colors.warning }}>
              Areas to Watch ({negativeCorrelations.length})
            </ThemedText>
          </View>
          {negativeCorrelations.slice(0, 2).map((correlation, index) => (
            <CorrelationCard key={`neg-${index}`} correlation={correlation} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  supplementBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  comparison: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  comparisonItem: {
    alignItems: "center",
  },
  arrow: {
    paddingHorizontal: 8,
  },
});
