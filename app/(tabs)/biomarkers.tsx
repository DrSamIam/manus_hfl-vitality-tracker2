import { useState } from "react";
import {
  ActivityIndicator,
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
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

const SHARED_BIOMARKERS = [
  { name: "Cortisol", unit: "µg/dL" },
  { name: "TSH (Thyroid Stimulating Hormone)", unit: "µIU/mL" },
  { name: "Free T3", unit: "pg/mL" },
  { name: "Free T4", unit: "ng/dL" },
  { name: "Vitamin D", unit: "ng/mL" },
  { name: "Vitamin B12", unit: "pg/mL" },
  { name: "Folate", unit: "ng/mL" },
  { name: "Magnesium", unit: "mg/dL" },
  { name: "Zinc", unit: "µg/dL" },
  { name: "Iron/Ferritin", unit: "ng/mL" },
  { name: "Total Cholesterol", unit: "mg/dL" },
  { name: "LDL Cholesterol", unit: "mg/dL" },
  { name: "HDL Cholesterol", unit: "mg/dL" },
  { name: "Triglycerides", unit: "mg/dL" },
  { name: "Glucose (Fasting)", unit: "mg/dL" },
  { name: "HbA1c", unit: "%" },
  { name: "Insulin", unit: "µIU/mL" },
  { name: "C-Reactive Protein (CRP)", unit: "mg/L" },
  { name: "Homocysteine", unit: "µmol/L" },
];

const MALE_BIOMARKERS = [
  { name: "Testosterone (Total)", unit: "ng/dL" },
  { name: "Testosterone (Free)", unit: "pg/mL" },
  { name: "SHBG (Sex Hormone Binding Globulin)", unit: "nmol/L" },
  { name: "Estradiol (E2)", unit: "pg/mL" },
  { name: "DHT (Dihydrotestosterone)", unit: "ng/dL" },
  { name: "PSA (Prostate-Specific Antigen)", unit: "ng/mL" },
];

const FEMALE_BIOMARKERS = [
  { name: "Estradiol (E2)", unit: "pg/mL" },
  { name: "Progesterone", unit: "ng/mL" },
  { name: "Testosterone (Total)", unit: "ng/dL" },
  { name: "Testosterone (Free)", unit: "pg/mL" },
  { name: "FSH (Follicle Stimulating Hormone)", unit: "mIU/mL" },
  { name: "LH (Luteinizing Hormone)", unit: "mIU/mL" },
  { name: "Prolactin", unit: "ng/mL" },
  { name: "AMH (Anti-Müllerian Hormone)", unit: "ng/mL" },
  { name: "DHEA-S", unit: "µg/dL" },
];

export default function BiomarkersScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<{ name: string; unit: string } | null>(null);
  const [value, setValue] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: biomarkers, refetch, isLoading } = trpc.biomarkers.list.useQuery(undefined, { enabled: isAuthenticated });
  const createBiomarker = trpc.biomarkers.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      resetForm();
    },
  });
  const deleteBiomarker = trpc.biomarkers.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const resetForm = () => {
    setSelectedBiomarker(null);
    setValue("");
    setTestDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const getBiomarkerOptions = () => {
    const sexSpecific =
      profile?.biologicalSex === "male"
        ? MALE_BIOMARKERS
        : profile?.biologicalSex === "female"
          ? FEMALE_BIOMARKERS
          : [...MALE_BIOMARKERS, ...FEMALE_BIOMARKERS];
    return [...sexSpecific, ...SHARED_BIOMARKERS];
  };

  const handleAddBiomarker = async () => {
    if (!selectedBiomarker || !value) return;
    await createBiomarker.mutateAsync({
      markerName: selectedBiomarker.name,
      value,
      unit: selectedBiomarker.unit,
      testDate,
      notes: notes || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Please log in to track biomarkers</ThemedText>
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
        <View style={styles.header}>
          <ThemedText type="title">Biomarkers</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Hormone & Biomarker Tracking
          </ThemedText>
        </View>

        {/* Add Button */}
        <Pressable
          onPress={() => setShowAddModal(true)}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.tint },
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
            + Add New Result
          </ThemedText>
        </Pressable>

        {/* Biomarkers List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : biomarkers && biomarkers.length > 0 ? (
          <View style={styles.biomarkersList}>
            {biomarkers.map((biomarker) => (
              <View key={biomarker.id} style={[styles.biomarkerCard, { backgroundColor: colors.surface }]}>
                <View style={styles.biomarkerHeader}>
                  <ThemedText type="defaultSemiBold">{biomarker.markerName}</ThemedText>
                  <Pressable
                    onPress={() => deleteBiomarker.mutate({ id: biomarker.id })}
                    style={styles.deleteButton}
                  >
                    <ThemedText style={{ color: colors.error }}>Delete</ThemedText>
                  </Pressable>
                </View>
                <View style={styles.biomarkerValue}>
                  <ThemedText type="title" style={{ color: colors.tint }}>
                    {biomarker.value}
                  </ThemedText>
                  <ThemedText style={[styles.unit, { color: colors.textSecondary }]}>
                    {biomarker.unit}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                  {formatDate(biomarker.testDate as unknown as string)}
                </ThemedText>
                {biomarker.notes && (
                  <ThemedText style={[styles.notes, { color: colors.textSecondary }]}>
                    {biomarker.notes}
                  </ThemedText>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>📊</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              No Biomarkers Yet
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add your first lab result to start tracking your hormones and biomarkers over time.
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Add Biomarker Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Add Biomarker Result</ThemedText>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <ThemedText style={{ color: colors.tint, fontSize: 16 }}>Cancel</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Biomarker Selection */}
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Select Biomarker
              </ThemedText>
              <View style={styles.biomarkerOptions}>
                {getBiomarkerOptions().map((option) => (
                  <Pressable
                    key={option.name}
                    onPress={() => setSelectedBiomarker(option)}
                    style={[
                      styles.biomarkerOption,
                      {
                        backgroundColor: selectedBiomarker?.name === option.name ? colors.tint : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: selectedBiomarker?.name === option.name ? "#FFFFFF" : colors.text,
                        fontSize: 13,
                      }}
                    >
                      {option.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Value Input */}
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Value {selectedBiomarker && `(${selectedBiomarker.unit})`}
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter value"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={value}
                onChangeText={setValue}
              />

              {/* Date Input */}
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Test Date
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={testDate}
                onChangeText={setTestDate}
              />

              {/* Notes Input */}
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Notes (Optional)
              </ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Add any notes..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />

              {/* Save Button */}
              <Pressable
                onPress={handleAddBiomarker}
                disabled={!selectedBiomarker || !value || createBiomarker.isPending}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: selectedBiomarker && value ? colors.tint : colors.surface },
                  pressed && styles.buttonPressed,
                ]}
              >
                {createBiomarker.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: selectedBiomarker && value ? "#FFFFFF" : colors.textSecondary }}
                  >
                    Add Result
                  </ThemedText>
                )}
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
  header: { marginBottom: 24 },
  subtitle: { fontSize: 16, marginTop: 4 },
  addButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonPressed: { opacity: 0.8 },
  addButtonText: { color: "#FFFFFF", fontSize: 16 },
  biomarkersList: { gap: 12 },
  biomarkerCard: { padding: 16, borderRadius: 12 },
  biomarkerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  deleteButton: { padding: 4 },
  biomarkerValue: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  unit: { fontSize: 14 },
  date: { fontSize: 12, marginTop: 8 },
  notes: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
  emptyState: { padding: 40, borderRadius: 16, alignItems: "center", marginTop: 20 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalScroll: { padding: 20 },
  inputLabel: { marginBottom: 8, marginTop: 16 },
  biomarkerOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  biomarkerOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  input: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 24, marginBottom: 40 },
});
