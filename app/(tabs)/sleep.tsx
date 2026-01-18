import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");
const RING_SIZE = width * 0.5;
const STROKE_WIDTH = 16;

const QUALITY_OPTIONS = [
  { value: 1, label: "Terrible", emoji: "😫" },
  { value: 2, label: "Poor", emoji: "😔" },
  { value: 3, label: "Fair", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😊" },
];

export default function SleepScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().split("T")[0];

  // Form state
  const [bedtime, setBedtime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [quality, setQuality] = useState(3);
  const [awakenings, setAwakenings] = useState("");
  const [notes, setNotes] = useState("");
  const [hasLogged, setHasLogged] = useState(false);

  const utils = trpc.useUtils();
  const { data: todayLog, isLoading } = trpc.sleep.today.useQuery();
  const { data: history } = trpc.sleep.list.useQuery();

  const logMutation = trpc.sleep.log.useMutation({
    onSuccess: () => {
      utils.sleep.today.invalidate();
      utils.sleep.list.invalidate();
      setHasLogged(true);
    },
  });

  useEffect(() => {
    if (todayLog) {
      setBedtime(todayLog.bedtime || "22:00");
      setWakeTime(todayLog.wakeTime || "06:00");
      setQuality(todayLog.quality || 3);
      setAwakenings(todayLog.awakenings?.toString() || "");
      setNotes(todayLog.notes || "");
      setHasLogged(true);
    }
  }, [todayLog]);

  const calculateDuration = () => {
    const [bedHour, bedMin] = bedtime.split(":").map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return wakeMinutes - bedMinutes;
  };

  const handleSave = () => {
    const duration = calculateDuration();

    logMutation.mutate({
      logDate: today,
      bedtime,
      wakeTime,
      durationMinutes: duration,
      quality,
      awakenings: awakenings ? parseInt(awakenings) : undefined,
      notes: notes || undefined,
    });
  };

  const durationMinutes = calculateDuration();
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const targetHours = 8;
  const progress = Math.min(durationMinutes / (targetHours * 60), 1);

  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const getProgressColor = () => {
    if (durationMinutes >= 7 * 60) return "#34C759";
    if (durationMinutes >= 6 * 60) return "#FF9500";
    return "#FF3B30";
  };

  const getQualityColor = (q: number) => {
    if (q >= 4) return "#34C759";
    if (q >= 3) return "#FF9500";
    return "#FF3B30";
  };

  // Calculate weekly averages
  const weeklyStats = history?.slice(0, 7).reduce(
    (acc, log: any) => {
      acc.totalDuration += log.durationMinutes || 0;
      acc.totalQuality += log.quality || 0;
      acc.count++;
      return acc;
    },
    { totalDuration: 0, totalQuality: 0, count: 0 }
  );

  const avgDuration = weeklyStats?.count ? weeklyStats.totalDuration / weeklyStats.count : 0;
  const avgQuality = weeklyStats?.count ? weeklyStats.totalQuality / weeklyStats.count : 0;

  const renderHistoryItem = ({ item }: { item: any }) => {
    const itemHours = Math.floor((item.durationMinutes || 0) / 60);
    const itemMins = (item.durationMinutes || 0) % 60;

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyLeft}>
          <ThemedText style={styles.historyDate}>
            {new Date(item.logDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </ThemedText>
          <ThemedText style={styles.historyTime}>
            {item.bedtime} → {item.wakeTime}
          </ThemedText>
        </View>
        <View style={styles.historyRight}>
          <ThemedText style={styles.historyDuration}>{itemHours}h {itemMins}m</ThemedText>
          {item.quality && (
            <ThemedText style={styles.historyQuality}>
              {QUALITY_OPTIONS.find((q) => q.value === item.quality)?.emoji}
            </ThemedText>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Sleep</ThemedText>
          <ThemedText style={styles.subtitle}>Track your rest for better recovery</ThemedText>
        </View>

        {/* Duration Ring */}
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle stroke="#E5E5EA" fill="none" cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={radius} strokeWidth={STROKE_WIDTH} />
            <Circle stroke={getProgressColor()} fill="none" cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={radius} strokeWidth={STROKE_WIDTH} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`} />
          </Svg>
          <View style={styles.ringCenter}>
            <ThemedText style={styles.ringIcon}>🌙</ThemedText>
            <ThemedText style={styles.ringValue}>{hours}h {minutes}m</ThemedText>
            <ThemedText style={styles.ringLabel}>Target: {targetHours}h</ThemedText>
          </View>
        </View>

        {/* Weekly Stats */}
        {weeklyStats && weeklyStats.count > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{Math.floor(avgDuration / 60)}h {Math.round(avgDuration % 60)}m</ThemedText>
              <ThemedText style={styles.statLabel}>Avg Duration (7d)</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{avgQuality.toFixed(1)}/5</ThemedText>
              <ThemedText style={styles.statLabel}>Avg Quality (7d)</ThemedText>
            </View>
          </View>
        )}

        {/* Log Form */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.sectionTitle}>Log Last Night's Sleep</ThemedText>

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <ThemedText style={styles.inputLabel}>Bedtime</ThemedText>
              <TextInput style={styles.input} value={bedtime} onChangeText={setBedtime} placeholder="22:00" placeholderTextColor="#8E8E93" />
            </View>
            <ThemedText style={styles.timeArrow}>→</ThemedText>
            <View style={styles.timeInput}>
              <ThemedText style={styles.inputLabel}>Wake Time</ThemedText>
              <TextInput style={styles.input} value={wakeTime} onChangeText={setWakeTime} placeholder="06:00" placeholderTextColor="#8E8E93" />
            </View>
          </View>

          <ThemedText style={styles.inputLabel}>Sleep Quality</ThemedText>
          <View style={styles.qualityContainer}>
            {QUALITY_OPTIONS.map((option) => (
              <Pressable key={option.value} style={[styles.qualityButton, quality === option.value && styles.qualityButtonActive]} onPress={() => setQuality(option.value)}>
                <ThemedText style={styles.qualityEmoji}>{option.emoji}</ThemedText>
                <ThemedText style={[styles.qualityLabel, quality === option.value && styles.qualityLabelActive]}>{option.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText style={styles.inputLabel}>Times Woken Up (Optional)</ThemedText>
          <TextInput style={styles.input} value={awakenings} onChangeText={setAwakenings} placeholder="0" placeholderTextColor="#8E8E93" keyboardType="number-pad" />

          <ThemedText style={styles.inputLabel}>Notes (Optional)</ThemedText>
          <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="How did you feel? Any dreams?" placeholderTextColor="#8E8E93" multiline numberOfLines={3} />

          <Pressable style={[styles.saveButton, logMutation.isPending && styles.saveButtonDisabled]} onPress={handleSave} disabled={logMutation.isPending}>
            {logMutation.isPending ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.saveButtonText}>{hasLogged ? "Update Sleep Log" : "Log Sleep"}</ThemedText>}
          </Pressable>
        </View>

        {/* History */}
        {history && history.length > 0 && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.sectionTitle}>Recent History</ThemedText>
            {history.slice(0, 7).map((item: any) => renderHistoryItem({ item }))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <ThemedText style={styles.sectionTitle}>Sleep Tips</ThemedText>
          <View style={styles.tipCard}>
            <ThemedText style={styles.tipIcon}>🌡️</ThemedText>
            <ThemedText style={styles.tipText}>Keep your bedroom cool (65-68°F) for optimal sleep.</ThemedText>
          </View>
          <View style={styles.tipCard}>
            <ThemedText style={styles.tipIcon}>📱</ThemedText>
            <ThemedText style={styles.tipText}>Avoid screens 1 hour before bed to improve sleep quality.</ThemedText>
          </View>
          <View style={styles.tipCard}>
            <ThemedText style={styles.tipIcon}>⏰</ThemedText>
            <ThemedText style={styles.tipText}>Maintain a consistent sleep schedule, even on weekends.</ThemedText>
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
  ringContainer: { alignItems: "center", justifyContent: "center", marginVertical: 16 },
  ringCenter: { position: "absolute", alignItems: "center" },
  ringIcon: { fontSize: 24, marginBottom: 4 },
  ringValue: { fontSize: 32, fontWeight: "700", color: "#007AFF" },
  ringLabel: { fontSize: 14, color: "#8E8E93" },
  statsContainer: { flexDirection: "row", backgroundColor: "#F2F2F7", borderRadius: 16, padding: 16, marginBottom: 24 },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "#E5E5EA" },
  statValue: { fontSize: 24, fontWeight: "700", color: "#007AFF" },
  statLabel: { fontSize: 12, color: "#8E8E93", marginTop: 4 },
  formContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, color: "#8E8E93", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  timeRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 16 },
  timeInput: { flex: 1 },
  timeArrow: { fontSize: 20, color: "#8E8E93", marginHorizontal: 12, marginBottom: 14 },
  inputLabel: { fontSize: 13, color: "#8E8E93", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, fontSize: 16, color: "#000" },
  textArea: { height: 80, textAlignVertical: "top" },
  qualityContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  qualityButton: { alignItems: "center", padding: 10, borderRadius: 12, backgroundColor: "#F2F2F7", flex: 1, marginHorizontal: 2 },
  qualityButtonActive: { backgroundColor: "#007AFF20", borderWidth: 2, borderColor: "#007AFF" },
  qualityEmoji: { fontSize: 24, marginBottom: 4 },
  qualityLabel: { fontSize: 10, color: "#8E8E93" },
  qualityLabelActive: { color: "#007AFF", fontWeight: "600" },
  saveButton: { backgroundColor: "#007AFF", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 16 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  historyContainer: { marginBottom: 24 },
  historyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, marginBottom: 8 },
  historyLeft: {},
  historyDate: { fontSize: 15, fontWeight: "600" },
  historyTime: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
  historyRight: { alignItems: "flex-end" },
  historyDuration: { fontSize: 17, fontWeight: "600", color: "#007AFF" },
  historyQuality: { fontSize: 20, marginTop: 4 },
  tipsContainer: { marginBottom: 24 },
  tipCard: { flexDirection: "row", backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, marginBottom: 8 },
  tipIcon: { fontSize: 20, marginRight: 12 },
  tipText: { flex: 1, fontSize: 14, color: "#636366", lineHeight: 20 },
});
