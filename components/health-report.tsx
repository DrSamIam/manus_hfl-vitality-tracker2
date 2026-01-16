import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, Alert } from "react-native";

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

interface Biomarker {
  markerName: string;
  value: string;
  unit: string;
  testDate: string;
}

interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  active: boolean;
}

interface Medication {
  drugName: string;
  dosage: string;
  frequency: string;
  reason?: string | null;
  active: boolean;
}

interface Workout {
  workoutDate: string;
  workoutType: string;
  name?: string | null;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
  intensity?: string | null;
}

interface FoodLog {
  logDate: string;
  mealType: string;
  totalCalories: number;
  totalProtein: string;
  totalCarbs: string;
  totalFat: string;
  healthScore?: number | null;
}

interface HealthReportProps {
  userName: string;
  biologicalSex: string;
  age: number | null;
  goals?: string[];
  symptoms: SymptomLog[];
  biomarkers: Biomarker[];
  supplements: Supplement[];
  medications?: Medication[];
  workouts?: Workout[];
  foodLogs?: FoodLog[];
  cycleData?: { startDate: string; endDate?: string }[];
}

export function HealthReportGenerator({
  userName,
  biologicalSex,
  age,
  goals,
  symptoms,
  biomarkers,
  supplements,
  medications = [],
  workouts = [],
  foodLogs = [],
}: HealthReportProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [generating, setGenerating] = useState(false);

  const calculateAverages = () => {
    if (symptoms.length === 0) return null;

    const last30Days = symptoms.slice(0, 30);
    const avg = (arr: (number | null)[]) => {
      const valid = arr.filter((v): v is number => v !== null);
      return valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1) : "N/A";
    };

    return {
      energy: avg(last30Days.map((s) => s.energy)),
      mood: avg(last30Days.map((s) => s.mood)),
      sleep: avg(last30Days.map((s) => s.sleep)),
      mentalClarity: avg(last30Days.map((s) => s.mentalClarity)),
      libido: avg(last30Days.map((s) => s.libido)),
      performance: avg(last30Days.map((s) => s.performanceStamina)),
    };
  };

  const calculateWorkoutStats = () => {
    if (workouts.length === 0) return null;
    const last30Days = workouts.filter((w) => {
      const wDate = new Date(w.workoutDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return wDate >= thirtyDaysAgo;
    });

    return {
      totalWorkouts: last30Days.length,
      totalMinutes: last30Days.reduce((sum, w) => sum + (w.durationMinutes || 0), 0),
      totalCalories: last30Days.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      avgPerWeek: ((last30Days.length / 30) * 7).toFixed(1),
    };
  };

  const calculateNutritionStats = () => {
    if (foodLogs.length === 0) return null;
    const last7Days = foodLogs.filter((f) => {
      const fDate = new Date(f.logDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return fDate >= sevenDaysAgo;
    });

    const daysLogged = new Set(last7Days.map((f) => f.logDate)).size;
    if (daysLogged === 0) return null;

    return {
      avgCalories: Math.round(last7Days.reduce((sum, f) => sum + f.totalCalories, 0) / daysLogged),
      avgProtein: Math.round(last7Days.reduce((sum, f) => sum + parseFloat(f.totalProtein), 0) / daysLogged),
      avgCarbs: Math.round(last7Days.reduce((sum, f) => sum + parseFloat(f.totalCarbs), 0) / daysLogged),
      avgFat: Math.round(last7Days.reduce((sum, f) => sum + parseFloat(f.totalFat), 0) / daysLogged),
      daysLogged,
    };
  };

  const generateReportContent = (): string => {
    const now = new Date();
    const reportDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const averages = calculateAverages();
    const workoutStats = calculateWorkoutStats();
    const nutritionStats = calculateNutritionStats();

    let report = `
╔═══════════════════════════════════════════════════════════════╗
║                    HFL VITALITY TRACKER                       ║
║                 COMPREHENSIVE HEALTH REPORT                   ║
╚═══════════════════════════════════════════════════════════════╝

Report Generated: ${reportDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT PROFILE
───────────────────────────────────────────────────────────────
  Name:           ${userName || "User"}
  Biological Sex: ${biologicalSex || "Not specified"}
  Age:            ${age || "Not specified"}
  Health Goals:   ${goals?.join(", ") || "Not specified"}

`;

    // Symptom Summary
    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SYMPTOM SUMMARY (30-DAY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (averages) {
      report += `
┌─────────────────────────┬──────────────┬─────────────────────┐
│ Metric                  │ Average      │ Status              │
├─────────────────────────┼──────────────┼─────────────────────┤
│ Energy                  │ ${averages.energy.padStart(12)} │ ${getStatusEmoji(averages.energy)} ${getStatusText(averages.energy).padEnd(15)} │
│ Mood                    │ ${averages.mood.padStart(12)} │ ${getStatusEmoji(averages.mood)} ${getStatusText(averages.mood).padEnd(15)} │
│ Sleep Quality           │ ${averages.sleep.padStart(12)} │ ${getStatusEmoji(averages.sleep)} ${getStatusText(averages.sleep).padEnd(15)} │
│ Mental Clarity          │ ${averages.mentalClarity.padStart(12)} │ ${getStatusEmoji(averages.mentalClarity)} ${getStatusText(averages.mentalClarity).padEnd(15)} │
│ Libido                  │ ${averages.libido.padStart(12)} │ ${getStatusEmoji(averages.libido)} ${getStatusText(averages.libido).padEnd(15)} │
│ Performance/Stamina     │ ${averages.performance.padStart(12)} │ ${getStatusEmoji(averages.performance)} ${getStatusText(averages.performance).padEnd(15)} │
└─────────────────────────┴──────────────┴─────────────────────┘

  Total Symptom Logs: ${symptoms.length}
  Days Tracked: ${new Set(symptoms.map((s) => s.logDate)).size}

`;
    } else {
      report += "  No symptom data available for this period.\n\n";
    }

    // Workout Summary
    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    EXERCISE SUMMARY (30-DAY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (workoutStats) {
      report += `
  Total Workouts:     ${workoutStats.totalWorkouts}
  Total Minutes:      ${workoutStats.totalMinutes}
  Calories Burned:    ${workoutStats.totalCalories}
  Avg Per Week:       ${workoutStats.avgPerWeek} workouts

  Recent Workouts:
`;
      workouts.slice(0, 5).forEach((w) => {
        const date = new Date(w.workoutDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        report += `    • ${date}: ${w.name || w.workoutType} - ${w.durationMinutes || 0}min${w.caloriesBurned ? `, ${w.caloriesBurned}cal` : ""}\n`;
      });
    } else {
      report += "  No workout data available.\n";
    }

    // Nutrition Summary
    report += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    NUTRITION SUMMARY (7-DAY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (nutritionStats) {
      report += `
  Daily Averages:
    Calories:  ${nutritionStats.avgCalories} kcal
    Protein:   ${nutritionStats.avgProtein}g
    Carbs:     ${nutritionStats.avgCarbs}g
    Fat:       ${nutritionStats.avgFat}g

  Days Logged: ${nutritionStats.daysLogged} / 7

`;
    } else {
      report += "  No nutrition data available.\n\n";
    }

    // Biomarkers
    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    BIOMARKER RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (biomarkers.length > 0) {
      const latestByName = new Map<string, Biomarker>();
      biomarkers.forEach((b) => {
        if (!latestByName.has(b.markerName)) {
          latestByName.set(b.markerName, b);
        }
      });

      report += `┌─────────────────────────┬──────────────┬──────────────┐
│ Marker                  │ Value        │ Test Date    │
├─────────────────────────┼──────────────┼──────────────┤
`;
      latestByName.forEach((biomarker) => {
        const testDate = new Date(biomarker.testDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const valueStr = `${biomarker.value} ${biomarker.unit}`;
        report += `│ ${biomarker.markerName.padEnd(23)} │ ${valueStr.padStart(12)} │ ${testDate.padStart(12)} │
`;
      });
      report += `└─────────────────────────┴──────────────┴──────────────┘
`;
    } else {
      report += "  No biomarker data available.\n";
    }

    // Medications
    report += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    CURRENT MEDICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    const activeMeds = medications.filter((m) => m.active);
    if (activeMeds.length > 0) {
      activeMeds.forEach((med) => {
        report += `  • ${med.drugName}
      Dosage: ${med.dosage}
      Frequency: ${med.frequency.replace(/_/g, " ")}
      ${med.reason ? `Reason: ${med.reason}` : ""}

`;
      });
    } else {
      report += "  No active medications.\n";
    }

    // Supplements
    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SUPPLEMENT PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    const activeSupplements = supplements.filter((s) => s.active);
    if (activeSupplements.length > 0) {
      const timingLabels: Record<string, string> = {
        morning: "Morning",
        evening: "Evening",
        with_meals: "With Meals",
        before_bed: "Before Bed",
        multiple_times: "Multiple Times Daily",
      };

      activeSupplements.forEach((supp) => {
        report += `  • ${supp.name}
      Dosage: ${supp.dosage}
      Timing: ${timingLabels[supp.timing] || supp.timing}

`;
      });
    } else {
      report += "  No active supplements.\n";
    }

    // Recent Symptom Logs
    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    RECENT SYMPTOM LOGS (7 DAYS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    const recentLogs = symptoms.slice(0, 7);
    if (recentLogs.length > 0) {
      report += `┌────────────┬────────┬──────┬───────┬─────────┬────────┬───────────┐
│ Date       │ Energy │ Mood │ Sleep │ Clarity │ Libido │ Perform.  │
├────────────┼────────┼──────┼───────┼─────────┼────────┼───────────┤
`;
      recentLogs.forEach((log) => {
        const logDate = new Date(log.logDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        report += `│ ${logDate.padEnd(10)} │ ${(log.energy?.toString() || "-").padStart(6)} │ ${(log.mood?.toString() || "-").padStart(4)} │ ${(log.sleep?.toString() || "-").padStart(5)} │ ${(log.mentalClarity?.toString() || "-").padStart(7)} │ ${(log.libido?.toString() || "-").padStart(6)} │ ${(log.performanceStamina?.toString() || "-").padStart(9)} │
`;
      });
      report += `└────────────┴────────┴──────┴───────┴─────────┴────────┴───────────┘
`;
    } else {
      report += "  No recent symptom logs.\n";
    }

    report += `

╔═══════════════════════════════════════════════════════════════╗
║                        END OF REPORT                          ║
╚═══════════════════════════════════════════════════════════════╝

This report was generated by HFL Vitality Tracker.
For informational purposes only. Not medical advice.
Consult with your healthcare provider for medical decisions.

Generated: ${now.toISOString()}
`;

    return report;
  };

  const getStatusEmoji = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return "⚪";
    if (num >= 8) return "🟢";
    if (num >= 6) return "🟡";
    if (num >= 4) return "🟠";
    return "🔴";
  };

  const getStatusText = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return "No data";
    if (num >= 8) return "Excellent";
    if (num >= 6) return "Good";
    if (num >= 4) return "Moderate";
    return "Needs attention";
  };

  const handleGenerateReport = async () => {
    setGenerating(true);

    try {
      const reportContent = generateReportContent();
      const fileName = `HFL-Health-Report-${new Date().toISOString().split("T")[0]}.txt`;
      const file = new File(Paths.cache, fileName);
      await file.write(reportContent);
      const filePath = file.uri;

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/plain",
          dialogTitle: "Share Health Report",
        });
      } else {
        Alert.alert(
          "Report Generated",
          "Your health report has been saved. Sharing is not available on this device.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      Alert.alert("Error", "Failed to generate health report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const activeMeds = medications.filter((m) => m.active);
  const workoutCount = workouts.length;
  const foodLogCount = foodLogs.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <ThemedText style={{ fontSize: 32 }}>📋</ThemedText>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">Health Report</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
            Comprehensive health summary for your provider
          </ThemedText>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Symptom Logs</ThemedText>
          <ThemedText type="defaultSemiBold">{symptoms.length}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Biomarker Results</ThemedText>
          <ThemedText type="defaultSemiBold">{biomarkers.length}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Active Supplements</ThemedText>
          <ThemedText type="defaultSemiBold">{supplements.filter((s) => s.active).length}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Active Medications</ThemedText>
          <ThemedText type="defaultSemiBold">{activeMeds.length}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Workouts Logged</ThemedText>
          <ThemedText type="defaultSemiBold">{workoutCount}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={{ color: colors.textSecondary }}>Meals Logged</ThemedText>
          <ThemedText type="defaultSemiBold">{foodLogCount}</ThemedText>
        </View>
      </View>

      <Pressable
        onPress={handleGenerateReport}
        disabled={generating}
        style={({ pressed }) => [
          styles.generateButton,
          { backgroundColor: colors.tint },
          pressed && styles.buttonPressed,
          generating && styles.buttonDisabled,
        ]}
      >
        {generating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText style={styles.buttonText}>Generate & Share Report</ThemedText>
        )}
      </Pressable>

      <ThemedText style={[styles.disclaimer, { color: colors.textSecondary }]}>
        Report includes symptoms, biomarkers, medications, supplements, workouts, and nutrition data.
        Share with your healthcare provider for personalized guidance.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  generateButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    marginTop: 12,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
