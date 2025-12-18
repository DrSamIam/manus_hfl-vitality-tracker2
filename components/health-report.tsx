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

interface HealthReportProps {
  userName: string;
  biologicalSex: string;
  age: number | null;
  symptoms: SymptomLog[];
  biomarkers: Biomarker[];
  supplements: Supplement[];
  cycleData?: { startDate: string; endDate?: string }[];
}

export function HealthReportGenerator({
  userName,
  biologicalSex,
  age,
  symptoms,
  biomarkers,
  supplements,
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

  const generateReportContent = (): string => {
    const now = new Date();
    const reportDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const averages = calculateAverages();

    let report = `
═══════════════════════════════════════════════════════════════
                    HFL VITALITY TRACKER
                      HEALTH REPORT
═══════════════════════════════════════════════════════════════

Report Generated: ${reportDate}
Patient: ${userName || "User"}
Biological Sex: ${biologicalSex || "Not specified"}
Age: ${age || "Not specified"}

───────────────────────────────────────────────────────────────
                    SYMPTOM SUMMARY (30-DAY)
───────────────────────────────────────────────────────────────

`;

    if (averages) {
      report += `
┌─────────────────────┬──────────────┐
│ Metric              │ Average      │
├─────────────────────┼──────────────┤
│ Energy              │ ${averages.energy.padStart(12)} │
│ Mood                │ ${averages.mood.padStart(12)} │
│ Sleep Quality       │ ${averages.sleep.padStart(12)} │
│ Mental Clarity      │ ${averages.mentalClarity.padStart(12)} │
│ Libido              │ ${averages.libido.padStart(12)} │
│ Performance/Stamina │ ${averages.performance.padStart(12)} │
└─────────────────────┴──────────────┘

Total Logs in Period: ${symptoms.length}
`;
    } else {
      report += "No symptom data available for this period.\n";
    }

    report += `
───────────────────────────────────────────────────────────────
                    BIOMARKER RESULTS
───────────────────────────────────────────────────────────────

`;

    if (biomarkers.length > 0) {
      // Group biomarkers by name and show most recent
      const latestByName = new Map<string, Biomarker>();
      biomarkers.forEach((b) => {
        if (!latestByName.has(b.markerName)) {
          latestByName.set(b.markerName, b);
        }
      });

      latestByName.forEach((biomarker) => {
        const testDate = new Date(biomarker.testDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        report += `${biomarker.markerName}
  Value: ${biomarker.value} ${biomarker.unit}
  Test Date: ${testDate}

`;
      });
    } else {
      report += "No biomarker data available.\n";
    }

    report += `
───────────────────────────────────────────────────────────────
                    SUPPLEMENT PROTOCOL
───────────────────────────────────────────────────────────────

`;

    const activeSupplements = supplements.filter((s) => s.active);
    if (activeSupplements.length > 0) {
      activeSupplements.forEach((supp) => {
        const timingLabel = {
          morning: "Morning",
          evening: "Evening",
          with_meals: "With Meals",
          before_bed: "Before Bed",
          multiple_times: "Multiple Times Daily",
        }[supp.timing] || supp.timing;

        report += `• ${supp.name}
  Dosage: ${supp.dosage}
  Timing: ${timingLabel}

`;
      });
    } else {
      report += "No active supplements.\n";
    }

    report += `
───────────────────────────────────────────────────────────────
                    RECENT SYMPTOM LOGS
───────────────────────────────────────────────────────────────

`;

    const recentLogs = symptoms.slice(0, 7);
    if (recentLogs.length > 0) {
      recentLogs.forEach((log) => {
        const logDate = new Date(log.logDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        report += `${logDate}: Energy ${log.energy ?? "-"} | Mood ${log.mood ?? "-"} | Sleep ${log.sleep ?? "-"} | Clarity ${log.mentalClarity ?? "-"}
`;
      });
    } else {
      report += "No recent symptom logs.\n";
    }

    report += `

═══════════════════════════════════════════════════════════════
                    END OF REPORT
═══════════════════════════════════════════════════════════════

This report was generated by HFL Vitality Tracker.
For informational purposes only. Not medical advice.
Consult with your healthcare provider for medical decisions.
`;

    return report;
  };

  const handleGenerateReport = async () => {
    setGenerating(true);

    try {
      const reportContent = generateReportContent();
      const fileName = `health-report-${new Date().toISOString().split("T")[0]}.txt`;
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

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <ThemedText style={{ fontSize: 32 }}>📋</ThemedText>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">Health Report</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
            Generate a summary of your health data
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
        Report includes 30-day symptom averages, biomarker results, and supplement protocol.
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
  },
});
