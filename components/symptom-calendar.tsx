import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, Modal, ScrollView } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getPhaseColor, getCurrentPhase } from "@/lib/cycle-utils";

interface SymptomLog {
  id: number;
  logDate: string;
  energy: number | null;
  mood: number | null;
  sleep: number | null;
  mentalClarity: number | null;
  libido: number | null;
  performanceStamina: number | null;
  notes: string | null;
}

interface CycleData {
  startDate: string;
  endDate?: string;
}

interface SymptomCalendarProps {
  symptoms: SymptomLog[];
  cycles?: CycleData[];
  cycleTrackingEnabled?: boolean;
  onDayPress?: (date: string, log?: SymptomLog) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function SymptomCalendar({ symptoms, cycles, cycleTrackingEnabled, onDayPress }: SymptomCalendarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLog, setSelectedLog] = useState<SymptomLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Create a map of dates to symptom logs
  const logsByDate = useMemo(() => {
    const map = new Map<string, SymptomLog>();
    symptoms.forEach((log) => {
      const dateStr = new Date(log.logDate).toISOString().split("T")[0];
      map.set(dateStr, log);
    });
    return map;
  }, [symptoms]);

  // Get cycle phase for a given date
  const getCyclePhaseForDate = (date: Date): string | null => {
    if (!cycleTrackingEnabled || !cycles || cycles.length === 0) return null;

    // Find the most recent cycle start before this date
    const sortedCycles = [...cycles].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    for (const cycle of sortedCycles) {
      const cycleStart = new Date(cycle.startDate);
      if (cycleStart <= date) {
        const daysSinceStart = Math.floor(
          (date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        
        if (daysSinceStart <= 28) { // Assume 28-day cycle
          return getCurrentPhase(daysSinceStart, 28, 5);
        }
        break;
      }
    }
    return null;
  };

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: Date | null; isCurrentMonth: boolean }> = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Add empty cells to complete the last week
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push({ date: null, isCurrentMonth: false });
      }
    }

    return days;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayPress = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const log = logsByDate.get(dateStr);
    
    if (log) {
      setSelectedLog(log);
      setShowDetailModal(true);
    }
    
    onDayPress?.(dateStr, log);
  };

  const getScoreColor = (score: number | null): string => {
    if (score === null) return colors.textSecondary;
    if (score >= 7) return colors.success;
    if (score >= 4) return colors.warning;
    return colors.error;
  };

  const getAverageScore = (log: SymptomLog): number => {
    const scores = [log.energy, log.mood, log.sleep, log.mentalClarity].filter(
      (s): s is number => s !== null
    );
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
          <ThemedText style={{ fontSize: 20, color: colors.tint }}>←</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </ThemedText>
        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <ThemedText style={{ fontSize: 20, color: colors.tint }}>→</ThemedText>
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarData.map((item, index) => {
          if (!item.date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateStr = item.date.toISOString().split("T")[0];
          const log = logsByDate.get(dateStr);
          const isToday = item.date.getTime() === today.getTime();
          const cyclePhase = getCyclePhaseForDate(item.date);
          const avgScore = log ? getAverageScore(log) : 0;

          return (
            <Pressable
              key={dateStr}
              style={[
                styles.dayCell,
                isToday && { borderColor: colors.tint, borderWidth: 2 },
              ]}
              onPress={() => handleDayPress(item.date!)}
            >
              {/* Cycle phase indicator */}
              {cyclePhase && (
                <View
                  style={[
                    styles.cycleIndicator,
                    { backgroundColor: getPhaseColor(cyclePhase) },
                  ]}
                />
              )}

              {/* Day number */}
              <ThemedText
                style={[
                  styles.dayNumber,
                  isToday && { color: colors.tint, fontWeight: "bold" },
                ]}
              >
                {item.date.getDate()}
              </ThemedText>

              {/* Log indicator */}
              {log && (
                <View
                  style={[
                    styles.logIndicator,
                    { backgroundColor: getScoreColor(avgScore) },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Good (7+)</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Moderate (4-6)</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Low (1-3)</ThemedText>
        </View>
      </View>

      {/* Cycle phase legend for females */}
      {cycleTrackingEnabled && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.menstruation }]} />
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Menstrual</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.follicular }]} />
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Follicular</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.ovulation }]} />
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Ovulation</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.luteal }]} />
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Luteal</ThemedText>
          </View>
        </View>
      )}

      {/* Day Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {selectedLog
                  ? new Date(selectedLog.logDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </ThemedText>
              <Pressable onPress={() => setShowDetailModal(false)}>
                <ThemedText style={{ color: colors.tint, fontSize: 16 }}>Close</ThemedText>
              </Pressable>
            </View>

            {selectedLog && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.scoreGrid}>
                  <View style={styles.scoreItem}>
                    <ThemedText style={{ fontSize: 24 }}>⚡</ThemedText>
                    <ThemedText type="title" style={{ color: getScoreColor(selectedLog.energy) }}>
                      {selectedLog.energy ?? "-"}
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Energy</ThemedText>
                  </View>
                  <View style={styles.scoreItem}>
                    <ThemedText style={{ fontSize: 24 }}>😊</ThemedText>
                    <ThemedText type="title" style={{ color: getScoreColor(selectedLog.mood) }}>
                      {selectedLog.mood ?? "-"}
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Mood</ThemedText>
                  </View>
                  <View style={styles.scoreItem}>
                    <ThemedText style={{ fontSize: 24 }}>😴</ThemedText>
                    <ThemedText type="title" style={{ color: getScoreColor(selectedLog.sleep) }}>
                      {selectedLog.sleep ?? "-"}
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Sleep</ThemedText>
                  </View>
                  <View style={styles.scoreItem}>
                    <ThemedText style={{ fontSize: 24 }}>🧠</ThemedText>
                    <ThemedText type="title" style={{ color: getScoreColor(selectedLog.mentalClarity) }}>
                      {selectedLog.mentalClarity ?? "-"}
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Clarity</ThemedText>
                  </View>
                </View>

                <View style={styles.scoreGrid}>
                  <View style={styles.scoreItem}>
                    <ThemedText style={{ fontSize: 24 }}>❤️</ThemedText>
                    <ThemedText type="title" style={{ color: getScoreColor(selectedLog.libido) }}>
                      {selectedLog.libido ?? "-"}
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Libido</ThemedText>
                  </View>
                  <View style={styles.scoreItem}>
                    <ThemedText style={{ fontSize: 24 }}>💪</ThemedText>
                    <ThemedText type="title" style={{ color: getScoreColor(selectedLog.performanceStamina) }}>
                      {selectedLog.performanceStamina ?? "-"}
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Performance</ThemedText>
                  </View>
                </View>

                {selectedLog.notes && (
                  <View style={[styles.notesSection, { backgroundColor: colors.surface }]}>
                    <ThemedText type="defaultSemiBold">Notes</ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, marginTop: 8 }}>
                      {selectedLog.notes}
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
  },
  cycleIndicator: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    height: 3,
    borderRadius: 2,
  },
  logIndicator: {
    position: "absolute",
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalBody: {
    padding: 20,
  },
  scoreGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: "center",
    gap: 4,
  },
  notesSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
});
