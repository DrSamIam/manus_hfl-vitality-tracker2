import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BarcodeScanner } from "@/components/barcode-scanner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

const TIMING_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "before_bed", label: "Before Bed" },
  { value: "multiple_times", label: "Multiple Times" },
] as const;

export default function SupplementsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const today = new Date().toISOString().split("T")[0];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState<typeof TIMING_OPTIONS[number]["value"]>("morning");
  const [notes, setNotes] = useState("");

  const { data: supplements, refetch, isLoading } = trpc.supplements.list.useQuery(
    { activeOnly: false },
    { enabled: isAuthenticated }
  );
  const { data: todaysLogs, refetch: refetchLogs } = trpc.supplementLogs.todaysLogs.useQuery(
    { today },
    { enabled: isAuthenticated }
  );

  const createSupplement = trpc.supplements.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      resetForm();
    },
  });
  const updateSupplement = trpc.supplements.update.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteSupplement = trpc.supplements.delete.useMutation({
    onSuccess: () => refetch(),
  });
  const createLog = trpc.supplementLogs.create.useMutation({
    onSuccess: () => refetchLogs(),
  });
  const updateLog = trpc.supplementLogs.update.useMutation({
    onSuccess: () => refetchLogs(),
  });

  const resetForm = () => {
    setName("");
    setDosage("");
    setTiming("morning");
    setNotes("");
  };

  const handleAddSupplement = async () => {
    if (!name || !dosage) return;
    await createSupplement.mutateAsync({
      name,
      dosage,
      timing,
      startDate: today,
      notes: notes || undefined,
    });
  };

  const handleProductFound = (product: { name: string; brand: string; ingredients?: string; servingSize?: string }) => {
    // Pre-fill the form with scanned product info
    const productName = product.brand 
      ? `${product.brand} ${product.name}`.trim()
      : product.name;
    
    setName(productName);
    
    // Try to extract dosage from serving size
    if (product.servingSize) {
      setDosage(product.servingSize);
    }
    
    // Add ingredients to notes if available
    if (product.ingredients) {
      const truncatedIngredients = product.ingredients.length > 200 
        ? product.ingredients.substring(0, 200) + "..."
        : product.ingredients;
      setNotes(`Ingredients: ${truncatedIngredients}`);
    }
    
    setShowAddModal(true);
  };

  const handleToggleLog = async (supplementId: number, period: "am" | "pm") => {
    const existingLog = todaysLogs?.find((log) => log.supplementId === supplementId);
    
    if (existingLog) {
      await updateLog.mutateAsync({
        id: existingLog.id,
        amTaken: period === "am" ? !existingLog.amTaken : existingLog.amTaken,
        pmTaken: period === "pm" ? !existingLog.pmTaken : existingLog.pmTaken,
      });
    } else {
      await createLog.mutateAsync({
        supplementId,
        logDate: today,
        amTaken: period === "am",
        pmTaken: period === "pm",
      });
    }
  };

  const getLogStatus = (supplementId: number) => {
    const log = todaysLogs?.find((l) => l.supplementId === supplementId);
    return {
      amTaken: log?.amTaken ?? false,
      pmTaken: log?.pmTaken ?? false,
    };
  };

  const activeSupplements = supplements?.filter((s) => s.active) ?? [];
  const inactiveSupplements = supplements?.filter((s) => !s.active) ?? [];

  // Calculate today's adherence
  const totalChecks = activeSupplements.length * 2;
  const completedChecks = activeSupplements.reduce((acc, s) => {
    const status = getLogStatus(s.id);
    return acc + (status.amTaken ? 1 : 0) + (status.pmTaken ? 1 : 0);
  }, 0);
  const adherencePercent = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Please log in to track supplements</ThemedText>
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
          <ThemedText type="title">Supplements</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Protocol Tracker
          </ThemedText>
        </View>

        {/* Today's Progress */}
        {activeSupplements.length > 0 && (
          <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
            <View style={styles.progressHeader}>
              <ThemedText type="defaultSemiBold">Today's Progress</ThemedText>
              <ThemedText type="title" style={{ color: colors.tint }}>
                {adherencePercent}%
              </ThemedText>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.tint,
                    width: `${adherencePercent}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>
              {completedChecks} of {totalChecks} doses logged
            </ThemedText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.tint, flex: 1 },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
              + Add Manually
            </ThemedText>
          </Pressable>
          
          <Pressable
            onPress={() => setShowBarcodeScanner(true)}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.surface, flex: 1, borderWidth: 1, borderColor: colors.tint },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint, fontSize: 16 }}>
              📷 Scan Barcode
            </ThemedText>
          </Pressable>
        </View>

        {/* Active Supplements */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : activeSupplements.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Active Protocol ({activeSupplements.length})
            </ThemedText>
            {activeSupplements.map((supplement) => {
              const status = getLogStatus(supplement.id);
              return (
                <View
                  key={supplement.id}
                  style={[styles.supplementCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.supplementHeader}>
                    <View style={styles.supplementInfo}>
                      <ThemedText type="defaultSemiBold">{supplement.name}</ThemedText>
                      <ThemedText style={{ color: colors.textSecondary, fontSize: 14 }}>
                        {supplement.dosage} • {TIMING_OPTIONS.find((t) => t.value === supplement.timing)?.label}
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={() => updateSupplement.mutate({ id: supplement.id, active: false })}
                      style={styles.pauseButton}
                    >
                      <ThemedText style={{ color: colors.warning, fontSize: 12 }}>Pause</ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.checkboxRow}>
                    <Pressable
                      onPress={() => handleToggleLog(supplement.id, "am")}
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: status.amTaken ? colors.success : colors.background,
                          borderColor: status.amTaken ? colors.success : colors.border,
                        },
                      ]}
                    >
                      {status.amTaken && <ThemedText style={{ color: "#FFFFFF" }}>✓</ThemedText>}
                    </Pressable>
                    <ThemedText style={{ marginRight: 24 }}>AM</ThemedText>

                    <Pressable
                      onPress={() => handleToggleLog(supplement.id, "pm")}
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: status.pmTaken ? colors.success : colors.background,
                          borderColor: status.pmTaken ? colors.success : colors.border,
                        },
                      ]}
                    >
                      {status.pmTaken && <ThemedText style={{ color: "#FFFFFF" }}>✓</ThemedText>}
                    </Pressable>
                    <ThemedText>PM</ThemedText>
                  </View>

                  {supplement.notes && (
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                      {supplement.notes}
                    </ThemedText>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>💊</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              No Supplements Yet
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add your supplements manually or scan a barcode to auto-fill product details.
            </ThemedText>
          </View>
        )}

        {/* Inactive Supplements */}
        {inactiveSupplements.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Paused ({inactiveSupplements.length})
            </ThemedText>
            {inactiveSupplements.map((supplement) => (
              <View
                key={supplement.id}
                style={[styles.supplementCard, styles.inactiveCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.supplementHeader}>
                  <View style={styles.supplementInfo}>
                    <ThemedText style={{ color: colors.textSecondary }}>{supplement.name}</ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 14 }}>
                      {supplement.dosage}
                    </ThemedText>
                  </View>
                  <View style={styles.inactiveActions}>
                    <Pressable
                      onPress={() => updateSupplement.mutate({ id: supplement.id, active: true })}
                      style={styles.resumeButton}
                    >
                      <ThemedText style={{ color: colors.success, fontSize: 12 }}>Resume</ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => deleteSupplement.mutate({ id: supplement.id })}
                      style={styles.deleteButton}
                    >
                      <ThemedText style={{ color: colors.error, fontSize: 12 }}>Delete</ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onProductFound={handleProductFound}
      />

      {/* Add Supplement Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Add Supplement</ThemedText>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <ThemedText style={{ color: colors.tint, fontSize: 16 }}>Cancel</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Name */}
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Supplement Name
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Vitamin D3"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />

              {/* Dosage */}
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Dosage
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., 5000 IU"
                placeholderTextColor={colors.textSecondary}
                value={dosage}
                onChangeText={setDosage}
              />

              {/* Timing */}
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Timing
              </ThemedText>
              <View style={styles.timingOptions}>
                {TIMING_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setTiming(option.value)}
                    style={[
                      styles.timingOption,
                      {
                        backgroundColor: timing === option.value ? colors.tint : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: timing === option.value ? "#FFFFFF" : colors.text,
                        fontSize: 13,
                      }}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Notes */}
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
                onPress={handleAddSupplement}
                disabled={!name || !dosage || createSupplement.isPending}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: name && dosage ? colors.tint : colors.surface },
                  pressed && styles.buttonPressed,
                ]}
              >
                {createSupplement.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: name && dosage ? "#FFFFFF" : colors.textSecondary }}
                  >
                    Add Supplement
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
  progressCard: { padding: 20, borderRadius: 12, marginBottom: 24 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  actionButtons: { flexDirection: "row", gap: 12, marginBottom: 24 },
  addButton: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonPressed: { opacity: 0.8 },
  addButtonText: { color: "#FFFFFF", fontSize: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 16 },
  supplementCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  inactiveCard: { opacity: 0.7 },
  supplementHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  supplementInfo: { flex: 1 },
  pauseButton: { padding: 4 },
  resumeButton: { padding: 4, marginRight: 12 },
  deleteButton: { padding: 4 },
  inactiveActions: { flexDirection: "row" },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 28, height: 28, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center", marginRight: 8 },
  emptyState: { padding: 40, borderRadius: 16, alignItems: "center", marginTop: 20 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalScroll: { padding: 20 },
  inputLabel: { marginBottom: 8, marginTop: 16 },
  input: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  timingOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timingOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 24, marginBottom: 40 },
});
