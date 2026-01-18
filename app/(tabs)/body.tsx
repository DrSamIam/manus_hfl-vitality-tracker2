import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";

const MEASUREMENT_FIELDS = [
  { key: "weight", label: "Weight", unit: "lbs", icon: "⚖️" },
  { key: "bodyFatPercent", label: "Body Fat", unit: "%", icon: "📊" },
  { key: "waist", label: "Waist", unit: "in", icon: "📏" },
  { key: "hips", label: "Hips", unit: "in", icon: "📏" },
  { key: "chest", label: "Chest", unit: "in", icon: "📏" },
  { key: "leftArm", label: "Left Arm", unit: "in", icon: "💪" },
  { key: "rightArm", label: "Right Arm", unit: "in", icon: "💪" },
  { key: "leftThigh", label: "Left Thigh", unit: "in", icon: "🦵" },
  { key: "rightThigh", label: "Right Thigh", unit: "in", icon: "🦵" },
  { key: "neck", label: "Neck", unit: "in", icon: "📏" },
];

type MeasurementKey = "weight" | "bodyFatPercent" | "waist" | "hips" | "chest" | "leftArm" | "rightArm" | "leftThigh" | "rightThigh" | "neck";

export default function BodyMeasurementsScreen() {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [measureDate, setMeasureDate] = useState(new Date().toISOString().split("T")[0]);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: history, isLoading } = trpc.measurements.list.useQuery();
  const { data: latest } = trpc.measurements.latest.useQuery();

  const createMutation = trpc.measurements.create.useMutation({
    onSuccess: () => {
      utils.measurements.list.invalidate();
      utils.measurements.latest.invalidate();
      resetForm();
      setShowAddModal(false);
    },
  });

  const deleteMutation = trpc.measurements.delete.useMutation({
    onSuccess: () => {
      utils.measurements.list.invalidate();
      utils.measurements.latest.invalidate();
    },
  });

  const resetForm = () => {
    setMeasureDate(new Date().toISOString().split("T")[0]);
    setMeasurements({});
    setNotes("");
  };

  const handleSave = () => {
    const hasAnyMeasurement = Object.values(measurements).some((v) => v && parseFloat(v) > 0);
    if (!hasAnyMeasurement) {
      Alert.alert("Error", "Please enter at least one measurement");
      return;
    }

    createMutation.mutate({
      measureDate,
      weight: measurements.weight ? parseFloat(measurements.weight) : undefined,
      bodyFatPercent: measurements.bodyFatPercent ? parseFloat(measurements.bodyFatPercent) : undefined,
      waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
      hips: measurements.hips ? parseFloat(measurements.hips) : undefined,
      chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
      leftArm: measurements.leftArm ? parseFloat(measurements.leftArm) : undefined,
      rightArm: measurements.rightArm ? parseFloat(measurements.rightArm) : undefined,
      leftThigh: measurements.leftThigh ? parseFloat(measurements.leftThigh) : undefined,
      rightThigh: measurements.rightThigh ? parseFloat(measurements.rightThigh) : undefined,
      neck: measurements.neck ? parseFloat(measurements.neck) : undefined,
      notes: notes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Measurement", "Are you sure you want to delete this measurement entry?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
    ]);
  };

  const getChange = (current: string | null, previous: string | null) => {
    if (!current || !previous) return null;
    const diff = parseFloat(current) - parseFloat(previous);
    if (Math.abs(diff) < 0.1) return null;
    return diff;
  };

  const renderHistoryItem = ({ item, index }: { item: any; index: number }) => {
    const previousItem = history && history[index + 1];

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <ThemedText style={styles.historyDate}>
            {new Date(item.measureDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </ThemedText>
          <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <ThemedText style={styles.deleteText}>×</ThemedText>
          </Pressable>
        </View>

        <View style={styles.measurementsGrid}>
          {MEASUREMENT_FIELDS.map((field) => {
            const value = item[field.key as MeasurementKey];
            if (!value) return null;

            const change = previousItem ? getChange(value, previousItem[field.key as MeasurementKey]) : null;
            const isLowerBetter = field.key === "weight" || field.key === "bodyFatPercent" || field.key === "waist";

            return (
              <View key={field.key} style={styles.measurementItem}>
                <ThemedText style={styles.measurementLabel}>{field.label}</ThemedText>
                <View style={styles.measurementValueRow}>
                  <ThemedText style={styles.measurementValue}>
                    {parseFloat(value).toFixed(1)} {field.unit}
                  </ThemedText>
                  {change !== null && (
                    <ThemedText style={[styles.changeText, { color: isLowerBetter ? (change < 0 ? "#34C759" : "#FF3B30") : (change > 0 ? "#34C759" : "#FF3B30") }]}>
                      {change > 0 ? "+" : ""}{change.toFixed(1)}
                    </ThemedText>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {item.notes && <ThemedText style={styles.notesText}>{item.notes}</ThemedText>}
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Body</ThemedText>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <ThemedText style={styles.addButtonText}>+ Log</ThemedText>
        </Pressable>
      </View>

      {latest && (
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryTitle}>Current Stats</ThemedText>
          <View style={styles.summaryGrid}>
            {latest.weight && (
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>{parseFloat(latest.weight).toFixed(1)}</ThemedText>
                <ThemedText style={styles.summaryLabel}>lbs</ThemedText>
              </View>
            )}
            {latest.bodyFatPercent && (
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>{parseFloat(latest.bodyFatPercent).toFixed(1)}</ThemedText>
                <ThemedText style={styles.summaryLabel}>% body fat</ThemedText>
              </View>
            )}
            {latest.waist && (
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>{parseFloat(latest.waist).toFixed(1)}</ThemedText>
                <ThemedText style={styles.summaryLabel}>in waist</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.lastUpdated}>Last updated: {new Date(latest.measureDate).toLocaleDateString()}</ThemedText>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : history && history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ThemedText style={styles.sectionTitle}>History</ThemedText>}
        />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyIcon}>📏</ThemedText>
          <ThemedText style={styles.emptyTitle}>No Measurements Yet</ThemedText>
          <ThemedText style={styles.emptyText}>Track your weight, body fat, and measurements to see your progress over time.</ThemedText>
        </View>
      )}

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { resetForm(); setShowAddModal(false); }}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
            <ThemedText type="subtitle">Log Measurements</ThemedText>
            <Pressable onPress={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? <ActivityIndicator size="small" /> : <ThemedText style={styles.saveText}>Save</ThemedText>}
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.inputLabel}>Date</ThemedText>
            <TextInput style={styles.input} value={measureDate} onChangeText={setMeasureDate} placeholder="YYYY-MM-DD" placeholderTextColor="#8E8E93" />

            <ThemedText style={styles.sectionLabel}>Measurements</ThemedText>
            <ThemedText style={styles.sectionHint}>Enter any measurements you want to track</ThemedText>

            {MEASUREMENT_FIELDS.map((field) => (
              <View key={field.key} style={styles.measurementInput}>
                <View style={styles.measurementInputLabel}>
                  <ThemedText style={styles.measurementIcon}>{field.icon}</ThemedText>
                  <ThemedText style={styles.measurementName}>{field.label}</ThemedText>
                </View>
                <View style={styles.measurementInputRight}>
                  <TextInput
                    style={styles.measurementTextInput}
                    value={measurements[field.key] || ""}
                    onChangeText={(text) => setMeasurements({ ...measurements, [field.key]: text })}
                    placeholder="0"
                    placeholderTextColor="#C7C7CC"
                    keyboardType="decimal-pad"
                  />
                  <ThemedText style={styles.unitText}>{field.unit}</ThemedText>
                </View>
              </View>
            ))}

            <ThemedText style={styles.inputLabel}>Notes (Optional)</ThemedText>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Any notes about this measurement..." placeholderTextColor="#8E8E93" multiline numberOfLines={3} />

            <View style={{ height: 100 }} />
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 28 },
  addButton: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  summaryCard: { marginHorizontal: 16, backgroundColor: "#F2F2F7", borderRadius: 16, padding: 20, marginBottom: 16 },
  summaryTitle: { fontSize: 13, color: "#8E8E93", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  summaryGrid: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 32, fontWeight: "700", color: "#007AFF" },
  summaryLabel: { fontSize: 13, color: "#8E8E93", marginTop: 4 },
  lastUpdated: { fontSize: 12, color: "#8E8E93", textAlign: "center", marginTop: 12 },
  sectionTitle: { fontSize: 13, color: "#8E8E93", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5, paddingHorizontal: 4 },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  historyCard: { backgroundColor: "#F2F2F7", borderRadius: 16, padding: 16, marginBottom: 12 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  historyDate: { fontSize: 15, fontWeight: "600" },
  deleteButton: { padding: 4 },
  deleteText: { fontSize: 24, color: "#FF3B30", fontWeight: "300" },
  measurementsGrid: { flexDirection: "row", flexWrap: "wrap" },
  measurementItem: { width: "50%", marginBottom: 12 },
  measurementLabel: { fontSize: 12, color: "#8E8E93" },
  measurementValueRow: { flexDirection: "row", alignItems: "baseline" },
  measurementValue: { fontSize: 17, fontWeight: "600" },
  changeText: { fontSize: 13, marginLeft: 6, fontWeight: "500" },
  notesText: { fontSize: 14, color: "#636366", marginTop: 8, fontStyle: "italic" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  emptyText: { fontSize: 15, color: "#8E8E93", textAlign: "center", lineHeight: 22 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  cancelText: { color: "#007AFF", fontSize: 17 },
  saveText: { color: "#007AFF", fontSize: 17, fontWeight: "600" },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  inputLabel: { fontSize: 13, color: "#8E8E93", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  sectionLabel: { fontSize: 13, color: "#8E8E93", marginTop: 20, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  sectionHint: { fontSize: 13, color: "#8E8E93", marginBottom: 12 },
  input: { backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, fontSize: 16, color: "#000" },
  textArea: { height: 80, textAlignVertical: "top" },
  measurementInput: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  measurementInputLabel: { flexDirection: "row", alignItems: "center" },
  measurementIcon: { fontSize: 20, marginRight: 10 },
  measurementName: { fontSize: 16 },
  measurementInputRight: { flexDirection: "row", alignItems: "center" },
  measurementTextInput: { width: 80, backgroundColor: "#F2F2F7", borderRadius: 8, padding: 10, fontSize: 16, textAlign: "right", color: "#000" },
  unitText: { fontSize: 14, color: "#8E8E93", marginLeft: 8, width: 40 },
});
