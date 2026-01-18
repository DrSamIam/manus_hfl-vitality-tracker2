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

type EntryType = "condition" | "surgery" | "allergy" | "family_history" | "hospitalization" | "injury";
type Status = "active" | "resolved" | "managed" | "ongoing";
type Severity = "mild" | "moderate" | "severe";

const ENTRY_TYPES: { value: EntryType; label: string; icon: string }[] = [
  { value: "condition", label: "Condition", icon: "🩺" },
  { value: "surgery", label: "Surgery", icon: "🏥" },
  { value: "allergy", label: "Allergy", icon: "⚠️" },
  { value: "family_history", label: "Family History", icon: "👨‍👩‍👧‍👦" },
  { value: "hospitalization", label: "Hospitalization", icon: "🛏️" },
  { value: "injury", label: "Injury", icon: "🩹" },
];

const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "#FF3B30" },
  { value: "managed", label: "Managed", color: "#FF9500" },
  { value: "ongoing", label: "Ongoing", color: "#007AFF" },
  { value: "resolved", label: "Resolved", color: "#34C759" },
];

const SEVERITIES: { value: Severity; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

const FAMILY_MEMBERS = ["Mother", "Father", "Sister", "Brother", "Grandmother", "Grandfather", "Aunt", "Uncle", "Child"];

export default function MedicalHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);
  const [filterType, setFilterType] = useState<EntryType | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState("");
  const [status, setStatus] = useState<Status>("active");
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [treatedBy, setTreatedBy] = useState("");
  const [familyMember, setFamilyMember] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.medicalHistory.list.useQuery(
    filterType ? { entryType: filterType } : undefined
  );

  const createMutation = trpc.medicalHistory.create.useMutation({
    onSuccess: () => {
      utils.medicalHistory.list.invalidate();
      resetForm();
      setShowAddModal(false);
    },
  });

  const deleteMutation = trpc.medicalHistory.delete.useMutation({
    onSuccess: () => {
      utils.medicalHistory.list.invalidate();
    },
  });

  const resetForm = () => {
    setName("");
    setDiagnosisDate("");
    setStatus("active");
    setSeverity(null);
    setTreatedBy("");
    setFamilyMember("");
    setNotes("");
    setSelectedType(null);
  };

  const handleSave = () => {
    if (!selectedType || !name.trim()) {
      Alert.alert("Error", "Please select a type and enter a name");
      return;
    }

    createMutation.mutate({
      entryType: selectedType,
      name: name.trim(),
      diagnosisDate: diagnosisDate || undefined,
      status: selectedType !== "family_history" ? status : undefined,
      severity: severity || undefined,
      treatedBy: treatedBy || undefined,
      familyMember: selectedType === "family_history" ? familyMember : undefined,
      notes: notes || undefined,
    });
  };

  const handleDelete = (id: number, entryName: string) => {
    Alert.alert(
      "Delete Entry",
      `Are you sure you want to delete "${entryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
      ]
    );
  };

  const getTypeInfo = (type: string) => ENTRY_TYPES.find((t) => t.value === type) || { icon: "📋", label: type };
  const getStatusInfo = (statusValue: string | null) => STATUSES.find((s) => s.value === statusValue) || { color: "#8E8E93", label: statusValue };

  const renderEntry = ({ item }: { item: any }) => {
    const typeInfo = getTypeInfo(item.entryType);
    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryTypeContainer}>
            <ThemedText style={styles.entryIcon}>{typeInfo.icon}</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.entryName}>{item.name}</ThemedText>
              <ThemedText style={styles.entryType}>{typeInfo.label}</ThemedText>
            </View>
          </View>
          <Pressable onPress={() => handleDelete(item.id, item.name)} style={styles.deleteButton}>
            <ThemedText style={styles.deleteText}>×</ThemedText>
          </Pressable>
        </View>

        <View style={styles.entryDetails}>
          {item.status && (
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "20" }]}>
              <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</ThemedText>
            </View>
          )}
          {item.severity && (
            <View style={styles.severityBadge}>
              <ThemedText style={styles.severityText}>{item.severity}</ThemedText>
            </View>
          )}
          {item.familyMember && (
            <View style={styles.familyBadge}>
              <ThemedText style={styles.familyText}>{item.familyMember}</ThemedText>
            </View>
          )}
        </View>

        {item.diagnosisDate && (
          <ThemedText style={styles.dateText}>📅 {new Date(item.diagnosisDate).toLocaleDateString()}</ThemedText>
        )}
        {item.treatedBy && <ThemedText style={styles.treatedByText}>👨‍⚕️ {item.treatedBy}</ThemedText>}
        {item.notes && <ThemedText style={styles.notesText}>{item.notes}</ThemedText>}
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Medical History</ThemedText>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Pressable style={[styles.filterTab, !filterType && styles.filterTabActive]} onPress={() => setFilterType(null)}>
          <ThemedText style={[styles.filterText, !filterType && styles.filterTextActive]}>All</ThemedText>
        </Pressable>
        {ENTRY_TYPES.map((type) => (
          <Pressable key={type.value} style={[styles.filterTab, filterType === type.value && styles.filterTabActive]} onPress={() => setFilterType(type.value)}>
            <ThemedText style={styles.filterIcon}>{type.icon}</ThemedText>
            <ThemedText style={[styles.filterText, filterType === type.value && styles.filterTextActive]}>{type.label}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : entries && entries.length > 0 ? (
        <FlatList data={entries} keyExtractor={(item) => item.id.toString()} renderItem={renderEntry} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyIcon}>📋</ThemedText>
          <ThemedText style={styles.emptyTitle}>No Medical History</ThemedText>
          <ThemedText style={styles.emptyText}>Add your conditions, surgeries, allergies, and family history to keep a complete health record.</ThemedText>
        </View>
      )}

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { resetForm(); setShowAddModal(false); }}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
            <ThemedText type="subtitle">Add Entry</ThemedText>
            <Pressable onPress={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? <ActivityIndicator size="small" /> : <ThemedText style={styles.saveText}>Save</ThemedText>}
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.sectionLabel}>Type</ThemedText>
            <View style={styles.typeGrid}>
              {ENTRY_TYPES.map((type) => (
                <Pressable key={type.value} style={[styles.typeButton, selectedType === type.value && styles.typeButtonActive]} onPress={() => setSelectedType(type.value)}>
                  <ThemedText style={styles.typeIcon}>{type.icon}</ThemedText>
                  <ThemedText style={[styles.typeLabel, selectedType === type.value && styles.typeLabelActive]}>{type.label}</ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={styles.sectionLabel}>Name / Description</ThemedText>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Type 2 Diabetes, Appendectomy, Penicillin" placeholderTextColor="#8E8E93" />

            {selectedType === "family_history" && (
              <>
                <ThemedText style={styles.sectionLabel}>Family Member</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {FAMILY_MEMBERS.map((member) => (
                    <Pressable key={member} style={[styles.chip, familyMember === member && styles.chipActive]} onPress={() => setFamilyMember(member)}>
                      <ThemedText style={[styles.chipText, familyMember === member && styles.chipTextActive]}>{member}</ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            <ThemedText style={styles.sectionLabel}>{selectedType === "surgery" || selectedType === "hospitalization" ? "Date" : "Diagnosis Date"} (Optional)</ThemedText>
            <TextInput style={styles.input} value={diagnosisDate} onChangeText={setDiagnosisDate} placeholder="YYYY-MM-DD" placeholderTextColor="#8E8E93" />

            {selectedType !== "family_history" && (
              <>
                <ThemedText style={styles.sectionLabel}>Status</ThemedText>
                <View style={styles.statusContainer}>
                  {STATUSES.map((s) => (
                    <Pressable key={s.value} style={[styles.statusButton, status === s.value && { backgroundColor: s.color + "20", borderColor: s.color }]} onPress={() => setStatus(s.value)}>
                      <ThemedText style={[styles.statusButtonText, status === s.value && { color: s.color }]}>{s.label}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <ThemedText style={styles.sectionLabel}>Severity (Optional)</ThemedText>
            <View style={styles.severityContainer}>
              {SEVERITIES.map((s) => (
                <Pressable key={s.value} style={[styles.severityButton, severity === s.value && styles.severityButtonActive]} onPress={() => setSeverity(severity === s.value ? null : s.value)}>
                  <ThemedText style={[styles.severityButtonText, severity === s.value && styles.severityButtonTextActive]}>{s.label}</ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={styles.sectionLabel}>Treated By (Optional)</ThemedText>
            <TextInput style={styles.input} value={treatedBy} onChangeText={setTreatedBy} placeholder="Doctor or specialist name" placeholderTextColor="#8E8E93" />

            <ThemedText style={styles.sectionLabel}>Notes (Optional)</ThemedText>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Additional details..." placeholderTextColor="#8E8E93" multiline numberOfLines={4} />

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
  filterContainer: { paddingHorizontal: 16, marginBottom: 16 },
  filterTab: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: "#F2F2F7" },
  filterTabActive: { backgroundColor: "#007AFF" },
  filterIcon: { marginRight: 4 },
  filterText: { color: "#8E8E93", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  entryCard: { backgroundColor: "#F2F2F7", borderRadius: 16, padding: 16, marginBottom: 12 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTypeContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  entryIcon: { fontSize: 32, marginRight: 12 },
  entryName: { fontSize: 17, fontWeight: "600" },
  entryType: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
  deleteButton: { padding: 4 },
  deleteText: { fontSize: 24, color: "#FF3B30", fontWeight: "300" },
  entryDetails: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600" },
  severityBadge: { backgroundColor: "#E5E5EA", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { fontSize: 12, color: "#8E8E93", textTransform: "capitalize" },
  familyBadge: { backgroundColor: "#E5E5EA", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  familyText: { fontSize: 12, color: "#8E8E93" },
  dateText: { fontSize: 13, color: "#8E8E93", marginTop: 8 },
  treatedByText: { fontSize: 13, color: "#8E8E93", marginTop: 4 },
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
  sectionLabel: { fontSize: 13, color: "#8E8E93", marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeButton: { width: "30%", aspectRatio: 1, backgroundColor: "#F2F2F7", borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  typeButtonActive: { borderColor: "#007AFF", backgroundColor: "#007AFF10" },
  typeIcon: { fontSize: 28, marginBottom: 4 },
  typeLabel: { fontSize: 12, color: "#8E8E93" },
  typeLabelActive: { color: "#007AFF", fontWeight: "600" },
  input: { backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, fontSize: 16, color: "#000" },
  textArea: { height: 100, textAlignVertical: "top" },
  chipContainer: { flexDirection: "row" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F2F2F7", marginRight: 8 },
  chipActive: { backgroundColor: "#007AFF" },
  chipText: { color: "#8E8E93" },
  chipTextActive: { color: "#fff" },
  statusContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: "#F2F2F7", borderWidth: 1, borderColor: "#E5E5EA" },
  statusButtonText: { fontSize: 14, color: "#8E8E93" },
  severityContainer: { flexDirection: "row", gap: 8 },
  severityButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F2F2F7", alignItems: "center" },
  severityButtonActive: { backgroundColor: "#007AFF" },
  severityButtonText: { fontSize: 14, color: "#8E8E93" },
  severityButtonTextActive: { color: "#fff", fontWeight: "600" },
});
