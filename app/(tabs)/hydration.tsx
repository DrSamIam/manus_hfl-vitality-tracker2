import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");
const RING_SIZE = width * 0.6;
const STROKE_WIDTH = 20;

const QUICK_ADD_OPTIONS = [
  { label: "Glass", oz: 8, icon: "🥛" },
  { label: "Bottle", oz: 16, icon: "🍶" },
  { label: "Large Bottle", oz: 24, icon: "🧴" },
  { label: "Cup", oz: 6, icon: "☕" },
];

const DEFAULT_GOAL = 100; // oz per day

export default function HydrationScreen() {
  const insets = useSafeAreaInsets();
  const [currentOz, setCurrentOz] = useState(0);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [entries, setEntries] = useState<{ time: string; amount: number }[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const utils = trpc.useUtils();
  const { data: todayLog, isLoading } = trpc.hydration.today.useQuery();
  const { data: history } = trpc.hydration.list.useQuery();

  const logMutation = trpc.hydration.log.useMutation({
    onSuccess: () => {
      utils.hydration.today.invalidate();
      utils.hydration.list.invalidate();
    },
  });

  useEffect(() => {
    if (todayLog) {
      setCurrentOz(todayLog.waterOz || 0);
      setGoal(todayLog.goal || DEFAULT_GOAL);
      setEntries((todayLog.entries as any) || []);
    } else {
      setCurrentOz(0);
      setGoal(DEFAULT_GOAL);
      setEntries([]);
    }
  }, [todayLog]);

  const addWater = (oz: number) => {
    const newTotal = currentOz + oz;
    const newEntry = { time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), amount: oz };
    const newEntries = [...entries, newEntry];

    setCurrentOz(newTotal);
    setEntries(newEntries);

    logMutation.mutate({
      logDate: today,
      waterOz: newTotal,
      goal,
      entries: newEntries,
    });
  };

  const removeLastEntry = () => {
    if (entries.length === 0) return;

    const lastEntry = entries[entries.length - 1];
    const newTotal = Math.max(0, currentOz - lastEntry.amount);
    const newEntries = entries.slice(0, -1);

    setCurrentOz(newTotal);
    setEntries(newEntries);

    logMutation.mutate({
      logDate: today,
      waterOz: newTotal,
      goal,
      entries: newEntries,
    });
  };

  const progress = Math.min(currentOz / goal, 1);
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const getProgressColor = () => {
    if (progress >= 1) return "#34C759";
    if (progress >= 0.75) return "#007AFF";
    if (progress >= 0.5) return "#FF9500";
    return "#FF3B30";
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const itemProgress = (item.waterOz || 0) / (item.goal || DEFAULT_GOAL);
    const achieved = itemProgress >= 1;

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyLeft}>
          <ThemedText style={styles.historyDate}>
            {new Date(item.logDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </ThemedText>
          <ThemedText style={styles.historyAmount}>
            {item.waterOz || 0} / {item.goal || DEFAULT_GOAL} oz
          </ThemedText>
        </View>
        <View style={[styles.historyBadge, { backgroundColor: achieved ? "#34C75920" : "#FF950020" }]}>
          <ThemedText style={[styles.historyBadgeText, { color: achieved ? "#34C759" : "#FF9500" }]}>
            {achieved ? "✓ Goal" : `${Math.round(itemProgress * 100)}%`}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Hydration</ThemedText>
          <ThemedText style={styles.subtitle}>Stay hydrated for optimal health</ThemedText>
        </View>

        {/* Progress Ring */}
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background circle */}
            <Circle
              stroke="#E5E5EA"
              fill="none"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Progress circle */}
            <Circle
              stroke={getProgressColor()}
              fill="none"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <ThemedText style={styles.ringIcon}>💧</ThemedText>
            <ThemedText style={styles.ringValue}>{currentOz}</ThemedText>
            <ThemedText style={styles.ringLabel}>of {goal} oz</ThemedText>
            {progress >= 1 && <ThemedText style={styles.goalReached}>Goal Reached! 🎉</ThemedText>}
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddContainer}>
          <ThemedText style={styles.sectionTitle}>Quick Add</ThemedText>
          <View style={styles.quickAddGrid}>
            {QUICK_ADD_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                style={({ pressed }) => [styles.quickAddButton, pressed && styles.quickAddButtonPressed]}
                onPress={() => addWater(option.oz)}
                disabled={logMutation.isPending}
              >
                <ThemedText style={styles.quickAddIcon}>{option.icon}</ThemedText>
                <ThemedText style={styles.quickAddLabel}>{option.label}</ThemedText>
                <ThemedText style={styles.quickAddOz}>+{option.oz} oz</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Today's Entries */}
        {entries.length > 0 && (
          <View style={styles.entriesContainer}>
            <View style={styles.entriesHeader}>
              <ThemedText style={styles.sectionTitle}>Today's Log</ThemedText>
              <Pressable onPress={removeLastEntry} disabled={logMutation.isPending}>
                <ThemedText style={styles.undoText}>Undo Last</ThemedText>
              </Pressable>
            </View>
            <View style={styles.entriesList}>
              {entries.slice().reverse().map((entry, index) => (
                <View key={index} style={styles.entryItem}>
                  <ThemedText style={styles.entryTime}>{entry.time}</ThemedText>
                  <ThemedText style={styles.entryAmount}>+{entry.amount} oz</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* History */}
        {history && history.length > 1 && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.sectionTitle}>History</ThemedText>
            {history.slice(1, 8).map((item: any) => renderHistoryItem({ item }))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <ThemedText style={styles.sectionTitle}>Hydration Tips</ThemedText>
          <View style={styles.tipCard}>
            <ThemedText style={styles.tipIcon}>💡</ThemedText>
            <ThemedText style={styles.tipText}>
              Drink a glass of water first thing in the morning to kickstart your metabolism.
            </ThemedText>
          </View>
          <View style={styles.tipCard}>
            <ThemedText style={styles.tipIcon}>🏃</ThemedText>
            <ThemedText style={styles.tipText}>
              Add 12-16 oz for every 30 minutes of exercise.
            </ThemedText>
          </View>
          <View style={styles.tipCard}>
            <ThemedText style={styles.tipIcon}>🍵</ThemedText>
            <ThemedText style={styles.tipText}>
              Herbal teas count toward your daily water intake!
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28 },
  subtitle: { fontSize: 15, color: "#8E8E93", marginTop: 4 },
  ringContainer: { alignItems: "center", justifyContent: "center", marginVertical: 20 },
  ringCenter: { position: "absolute", alignItems: "center" },
  ringIcon: { fontSize: 32, marginBottom: 4 },
  ringValue: { fontSize: 48, fontWeight: "700", color: "#007AFF" },
  ringLabel: { fontSize: 16, color: "#8E8E93" },
  goalReached: { fontSize: 14, color: "#34C759", fontWeight: "600", marginTop: 8 },
  quickAddContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, color: "#8E8E93", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  quickAddGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickAddButton: { width: "47%", backgroundColor: "#F2F2F7", borderRadius: 16, padding: 16, alignItems: "center" },
  quickAddButtonPressed: { backgroundColor: "#E5E5EA", transform: [{ scale: 0.98 }] },
  quickAddIcon: { fontSize: 32, marginBottom: 8 },
  quickAddLabel: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  quickAddOz: { fontSize: 14, color: "#007AFF", fontWeight: "500" },
  entriesContainer: { marginBottom: 24 },
  entriesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  undoText: { color: "#FF3B30", fontSize: 14, fontWeight: "500" },
  entriesList: { backgroundColor: "#F2F2F7", borderRadius: 16, padding: 12 },
  entryItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  entryTime: { fontSize: 14, color: "#8E8E93" },
  entryAmount: { fontSize: 14, fontWeight: "600", color: "#007AFF" },
  historyContainer: { marginBottom: 24 },
  historyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, marginBottom: 8 },
  historyLeft: {},
  historyDate: { fontSize: 15, fontWeight: "600" },
  historyAmount: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  historyBadgeText: { fontSize: 12, fontWeight: "600" },
  tipsContainer: { marginBottom: 24 },
  tipCard: { flexDirection: "row", backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, marginBottom: 8 },
  tipIcon: { fontSize: 20, marginRight: 12 },
  tipText: { flex: 1, fontSize: 14, color: "#636366", lineHeight: 20 },
});
