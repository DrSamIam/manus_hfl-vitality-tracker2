import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "as_needed", label: "As needed" },
  { value: "weekly", label: "Weekly" },
  { value: "other", label: "Other" },
] as const;

const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "bedtime", label: "Bedtime" },
  { value: "with_meals", label: "With meals" },
  { value: "multiple", label: "Multiple times" },
] as const;

type Frequency = typeof FREQUENCY_OPTIONS[number]["value"];
type TimeOfDay = typeof TIME_OPTIONS[number]["value"];

export default function MedicationsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [showStoppedSection, setShowStoppedSection] = useState(false);

  // Form state
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("once_daily");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | undefined>();
  const [reason, setReason] = useState("");
  const [prescriber, setPrescriber] = useState("");
  const [notes, setNotes] = useState("");

  const { data: medications, refetch, isLoading } = trpc.medications.list.useQuery({}, { enabled: isAuthenticated });
  const createMutation = trpc.medications.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      resetForm();
    },
  });
  const updateMutation = trpc.medications.update.useMutation({
    onSuccess: () => {
      refetch();
      setShowEditModal(false);
      setEditingMed(null);
    },
  });
  const deleteMutation = trpc.medications.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const resetForm = () => {
    setDrugName("");
    setDosage("");
    setFrequency("once_daily");
    setTimeOfDay(undefined);
    setReason("");
    setPrescriber("");
    setNotes("");
  };

  const handleAdd = async () => {
    if (!drugName || !dosage) return;
    await createMutation.mutateAsync({
      drugName,
      dosage,
      frequency,
      timeOfDay,
      reason: reason || undefined,
      prescriber: prescriber || undefined,
      startDate: new Date().toISOString().split("T")[0],
      notes: notes || undefined,
    });
  };

  const handleEdit = (med: any) => {
    setEditingMed(med);
    setDrugName(med.drugName);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setTimeOfDay(med.timeOfDay);
    setReason(med.reason || "");
    setPrescriber(med.prescriber || "");
    setNotes(med.notes || "");
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingMed) return;
    await updateMutation.mutateAsync({
      id: editingMed.id,
      drugName,
      dosage,
      frequency,
      timeOfDay,
      reason: reason || undefined,
      prescriber: prescriber || undefined,
      notes: notes || undefined,
    });
  };

  const handleStopTaking = async (med: any) => {
    await updateMutation.mutateAsync({ id: med.id, active: false });
  };

  const handleResume = async (med: any) => {
    await updateMutation.mutateAsync({ id: med.id, active: true });
  };

  const handleDelete = (med: any) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to permanently delete ${med.drugName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate({ id: med.id }),
        },
      ]
    );
  };

  const activeMeds = medications?.filter((m) => m.active) || [];
  const stoppedMeds = medications?.filter((m) => !m.active) || [];

  const formatFrequency = (freq: string) => {
    return FREQUENCY_OPTIONS.find((f) => f.value === freq)?.label || freq;
  };

  const formatTimeOfDay = (time: string | null) => {
    if (!time) return null;
    return TIME_OPTIONS.find((t) => t.value === time)?.label || time;
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Please log in to track medications</ThemedText>
      </ThemedView>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Medications</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Track your prescription medications
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.tint },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: "#FFFFFF" }}>
              + Add
            </ThemedText>
          </Pressable>
        </View>

        {/* Active Medications */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : activeMeds.length > 0 ? (
          <View style={styles.medsList}>
            {activeMeds.map((med) => (
              <View key={med.id} style={[styles.medCard, { backgroundColor: colors.surface }]}>
                <View style={styles.medHeader}>
                  <View style={styles.medInfo}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                      {med.drugName}
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary }}>
                      {med.dosage} • {formatFrequency(med.frequency)}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => handleEdit(med)}
                    style={[styles.menuButton, { backgroundColor: colors.background }]}
                  >
                    <ThemedText style={{ fontSize: 18 }}>⋯</ThemedText>
                  </Pressable>
                </View>
                {med.timeOfDay && (
                  <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                    ⏰ {formatTimeOfDay(med.timeOfDay)}
                  </ThemedText>
                )}
                {med.reason && (
                  <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                    💊 For: {med.reason}
                  </ThemedText>
                )}
                {med.prescriber && (
                  <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                    👨‍⚕️ Prescribed by: {med.prescriber}
                  </ThemedText>
                )}
                {med.notes && (
                  <ThemedText style={[styles.notes, { color: colors.textSecondary }]}>
                    {med.notes}
                  </ThemedText>
                )}
                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => handleStopTaking(med)}
                    style={[styles.actionButton, { borderColor: colors.border }]}
                  >
                    <ThemedText style={{ color: colors.textSecondary }}>I Stopped Taking This</ThemedText>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>💊</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              No medications yet
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add your prescription medications to help Dr. Sam provide better insights
            </ThemedText>
          </View>
        )}

        {/* Stopped Taking Section */}
        {stoppedMeds.length > 0 && (
          <View style={styles.stoppedSection}>
            <Pressable
              onPress={() => setShowStoppedSection(!showStoppedSection)}
              style={styles.stoppedHeader}
            >
              <ThemedText type="defaultSemiBold" style={{ color: colors.textSecondary }}>
                Stopped Taking ({stoppedMeds.length})
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary }}>
                {showStoppedSection ? "▼" : "▶"}
              </ThemedText>
            </Pressable>
            {showStoppedSection && (
              <View style={styles.stoppedList}>
                {stoppedMeds.map((med) => (
                  <View
                    key={med.id}
                    style={[styles.stoppedCard, { backgroundColor: colors.surface, opacity: 0.7 }]}
                  >
                    <View style={styles.stoppedInfo}>
                      <ThemedText style={{ color: colors.textSecondary }}>
                        {med.drugName} - {med.dosage}
                      </ThemedText>
                    </View>
                    <View style={styles.stoppedActions}>
                      <Pressable onPress={() => handleResume(med)}>
                        <ThemedText style={{ color: colors.tint }}>Start Again</ThemedText>
                      </Pressable>
                      <Pressable onPress={() => handleDelete(med)}>
                        <ThemedText style={{ color: colors.error }}>Delete</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Add Medication</ThemedText>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <ThemedText style={{ color: colors.tint }}>Cancel</ThemedText>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Drug Name *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Lipitor (Atorvastatin)"
                placeholderTextColor={colors.textSecondary}
                value={drugName}
                onChangeText={setDrugName}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Dosage *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., 10 mg"
                placeholderTextColor={colors.textSecondary}
                value={dosage}
                onChangeText={setDosage}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Frequency *</ThemedText>
              <View style={styles.optionGrid}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setFrequency(opt.value)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: frequency === opt.value ? colors.tint : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{ color: frequency === opt.value ? "#FFFFFF" : colors.text, fontSize: 13 }}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Time of Day</ThemedText>
              <View style={styles.optionGrid}>
                {TIME_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTimeOfDay(timeOfDay === opt.value ? undefined : opt.value)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: timeOfDay === opt.value ? colors.tint : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{ color: timeOfDay === opt.value ? "#FFFFFF" : colors.text, fontSize: 13 }}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Reason (Optional)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., High cholesterol"
                placeholderTextColor={colors.textSecondary}
                value={reason}
                onChangeText={setReason}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Prescriber (Optional)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Dr. Smith"
                placeholderTextColor={colors.textSecondary}
                value={prescriber}
                onChangeText={setPrescriber}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Notes (Optional)</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Any additional notes..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />

              <Pressable
                onPress={handleAdd}
                disabled={!drugName || !dosage || createMutation.isPending}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: drugName && dosage ? colors.tint : colors.surface },
                  pressed && styles.buttonPressed,
                ]}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: drugName && dosage ? "#FFFFFF" : colors.textSecondary }}
                  >
                    Add Medication
                  </ThemedText>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Edit Medication</ThemedText>
              <Pressable onPress={() => { setShowEditModal(false); setEditingMed(null); resetForm(); }}>
                <ThemedText style={{ color: colors.tint }}>Cancel</ThemedText>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Drug Name</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={drugName}
                onChangeText={setDrugName}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Dosage</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={dosage}
                onChangeText={setDosage}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Frequency</ThemedText>
              <View style={styles.optionGrid}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setFrequency(opt.value)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: frequency === opt.value ? colors.tint : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{ color: frequency === opt.value ? "#FFFFFF" : colors.text, fontSize: 13 }}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Time of Day</ThemedText>
              <View style={styles.optionGrid}>
                {TIME_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTimeOfDay(timeOfDay === opt.value ? undefined : opt.value)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: timeOfDay === opt.value ? colors.tint : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{ color: timeOfDay === opt.value ? "#FFFFFF" : colors.text, fontSize: 13 }}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Reason</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={reason}
                onChangeText={setReason}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Prescriber</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={prescriber}
                onChangeText={setPrescriber}
              />

              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Notes</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />

              <Pressable
                onPress={handleUpdate}
                disabled={updateMutation.isPending}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: colors.tint },
                  pressed && styles.buttonPressed,
                ]}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="defaultSemiBold" style={{ color: "#FFFFFF" }}>
                    Save Changes
                  </ThemedText>
                )}
              </Pressable>

              <Pressable
                onPress={() => editingMed && handleDelete(editingMed)}
                style={[styles.deleteButton, { borderColor: colors.error }]}
              >
                <ThemedText style={{ color: colors.error }}>Delete Medication</ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  subtitle: { fontSize: 16, marginTop: 4 },
  addButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  buttonPressed: { opacity: 0.8 },
  medsList: { gap: 16 },
  medCard: { padding: 16, borderRadius: 12 },
  medHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  medInfo: { flex: 1 },
  menuButton: { padding: 8, borderRadius: 8 },
  detailText: { fontSize: 14, marginTop: 8 },
  notes: { fontSize: 13, marginTop: 8, fontStyle: "italic" },
  actionButtons: { marginTop: 12 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, alignItems: "center" },
  emptyState: { padding: 40, borderRadius: 16, alignItems: "center", marginTop: 20 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  stoppedSection: { marginTop: 32 },
  stoppedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  stoppedList: { gap: 8 },
  stoppedCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 8 },
  stoppedInfo: { flex: 1 },
  stoppedActions: { flexDirection: "row", gap: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalScroll: { padding: 20 },
  inputLabel: { marginBottom: 8, marginTop: 16 },
  input: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 24 },
  deleteButton: { paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 12, marginBottom: 40, borderWidth: 1 },
});
