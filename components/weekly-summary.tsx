import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

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

interface WeeklySummaryData {
  weekStart: Date;
  weekEnd: Date;
  averages: {
    energy: number;
    mood: number;
    sleep: number;
    mentalClarity: number;
    libido: number;
    performanceStamina: number;
  };
  trends: {
    energy: "up" | "down" | "stable";
    mood: "up" | "down" | "stable";
    sleep: "up" | "down" | "stable";
    mentalClarity: "up" | "down" | "stable";
    libido: "up" | "down" | "stable";
    performanceStamina: "up" | "down" | "stable";
  };
  logsCount: number;
  bestDay: string;
  worstDay: string;
}

/**
 * Calculate weekly summary from symptom logs
 */
export function calculateWeeklySummary(symptoms: SymptomLog[]): WeeklySummaryData | null {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(today);
  weekEnd.setHours(23, 59, 59, 999);

  // Filter symptoms for this week
  const thisWeekSymptoms = symptoms.filter((s) => {
    const logDate = new Date(s.logDate);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  if (thisWeekSymptoms.length === 0) return null;

  // Calculate averages
  const metrics = ["energy", "mood", "sleep", "mentalClarity", "libido", "performanceStamina"] as const;
  const averages: Record<string, number> = {};

  for (const metric of metrics) {
    const values = thisWeekSymptoms
      .map((s) => s[metric])
      .filter((v): v is number => v !== null);
    averages[metric] = values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0;
  }

  // Calculate trends (compare first half to second half of week)
  const midpoint = Math.floor(thisWeekSymptoms.length / 2);
  const firstHalf = thisWeekSymptoms.slice(0, midpoint);
  const secondHalf = thisWeekSymptoms.slice(midpoint);

  const trends: Record<string, "up" | "down" | "stable"> = {};
  for (const metric of metrics) {
    const firstAvg = firstHalf.length > 0
      ? firstHalf.map((s) => s[metric]).filter((v): v is number => v !== null).reduce((a, b) => a + b, 0) / firstHalf.length
      : 0;
    const secondAvg = secondHalf.length > 0
      ? secondHalf.map((s) => s[metric]).filter((v): v is number => v !== null).reduce((a, b) => a + b, 0) / secondHalf.length
      : 0;

    if (secondAvg > firstAvg + 0.5) {
      trends[metric] = "up";
    } else if (secondAvg < firstAvg - 0.5) {
      trends[metric] = "down";
    } else {
      trends[metric] = "stable";
    }
  }

  // Find best and worst days
  const dayScores = thisWeekSymptoms.map((s) => {
    const values = metrics.map((m) => s[m]).filter((v): v is number => v !== null);
    const avgScore = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { date: s.logDate, score: avgScore };
  });

  const sortedDays = [...dayScores].sort((a, b) => b.score - a.score);
  const bestDay = sortedDays[0]?.date || "";
  const worstDay = sortedDays[sortedDays.length - 1]?.date || "";

  return {
    weekStart,
    weekEnd,
    averages: averages as WeeklySummaryData["averages"],
    trends: trends as WeeklySummaryData["trends"],
    logsCount: thisWeekSymptoms.length,
    bestDay,
    worstDay,
  };
}

interface MetricBarProps {
  label: string;
  value: number;
  trend: "up" | "down" | "stable";
  emoji: string;
}

function MetricBar({ label, value, trend, emoji }: MetricBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const barWidth = 200;
  const barHeight = 8;
  const fillWidth = (value / 10) * barWidth;

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor = trend === "up" ? colors.success : trend === "down" ? colors.error : colors.textSecondary;

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricLabel}>
        <ThemedText style={{ fontSize: 16 }}>{emoji}</ThemedText>
        <ThemedText style={{ fontSize: 13 }}>{label}</ThemedText>
      </View>
      <View style={styles.metricValue}>
        <Svg width={barWidth} height={barHeight}>
          <Rect
            x={0}
            y={0}
            width={barWidth}
            height={barHeight}
            rx={4}
            fill={colors.border}
          />
          <Rect
            x={0}
            y={0}
            width={fillWidth}
            height={barHeight}
            rx={4}
            fill={colors.tint}
          />
        </Svg>
        <View style={styles.valueText}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
            {value}
          </ThemedText>
          <ThemedText style={{ color: trendColor, fontSize: 12 }}>{trendIcon}</ThemedText>
        </View>
      </View>
    </View>
  );
}

interface WeeklySummaryProps {
  symptoms: SymptomLog[];
}

export function WeeklySummary({ symptoms }: WeeklySummaryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const summary = useMemo(() => calculateWeeklySummary(symptoms), [symptoms]);

  if (!summary) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Weekly Summary
        </ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={{ fontSize: 40, marginBottom: 12 }}>📅</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, textAlign: "center" }}>
            No data for this week yet. Start logging your symptoms to see your weekly summary.
          </ThemedText>
        </View>
      </View>
    );
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Weekly Summary</ThemedText>
        <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
          {formatDate(summary.weekStart)} - {formatDate(summary.weekEnd)}
        </ThemedText>
      </View>

      {/* Completion Badge */}
      <View style={[styles.completionBadge, { backgroundColor: colors.tint + "15" }]}>
        <ThemedText style={{ fontSize: 24 }}>📊</ThemedText>
        <View>
          <ThemedText type="defaultSemiBold">
            {summary.logsCount} of 7 days logged
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
            {Math.round((summary.logsCount / 7) * 100)}% completion rate
          </ThemedText>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metrics}>
        <MetricBar
          label="Energy"
          value={summary.averages.energy}
          trend={summary.trends.energy}
          emoji="⚡"
        />
        <MetricBar
          label="Mood"
          value={summary.averages.mood}
          trend={summary.trends.mood}
          emoji="😊"
        />
        <MetricBar
          label="Sleep"
          value={summary.averages.sleep}
          trend={summary.trends.sleep}
          emoji="😴"
        />
        <MetricBar
          label="Clarity"
          value={summary.averages.mentalClarity}
          trend={summary.trends.mentalClarity}
          emoji="🧠"
        />
        <MetricBar
          label="Libido"
          value={summary.averages.libido}
          trend={summary.trends.libido}
          emoji="❤️"
        />
        <MetricBar
          label="Performance"
          value={summary.averages.performanceStamina}
          trend={summary.trends.performanceStamina}
          emoji="💪"
        />
      </View>

      {/* Best/Worst Days */}
      <View style={styles.daysRow}>
        <View style={[styles.dayCard, { backgroundColor: colors.success + "15" }]}>
          <ThemedText style={{ fontSize: 20 }}>🌟</ThemedText>
          <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Best Day</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 13 }}>
            {formatDayName(summary.bestDay)}
          </ThemedText>
        </View>
        <View style={[styles.dayCard, { backgroundColor: colors.warning + "15" }]}>
          <ThemedText style={{ fontSize: 20 }}>💤</ThemedText>
          <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Toughest Day</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 13 }}>
            {formatDayName(summary.worstDay)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  completionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  metrics: {
    gap: 12,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 100,
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  valueText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 50,
  },
  daysRow: {
    flexDirection: "row",
    gap: 12,
  },
  dayCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
});
