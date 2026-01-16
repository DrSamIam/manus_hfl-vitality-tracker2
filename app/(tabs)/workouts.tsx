import { useState, useMemo } from "react";
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

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

const WORKOUT_TYPES = [
  { id: "strength", label: "Strength", icon: "💪" },
  { id: "cardio", label: "Cardio", icon: "🏃" },
  { id: "hiit", label: "HIIT", icon: "⚡" },
  { id: "yoga", label: "Yoga", icon: "🧘" },
  { id: "stretching", label: "Stretching", icon: "🤸" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "walking", label: "Walking", icon: "🚶" },
  { id: "other", label: "Other", icon: "🎯" },
] as const;

const INTENSITY_LEVELS = [
  { id: "low", label: "Low", color: "#4CAF50" },
  { id: "moderate", label: "Moderate", color: "#FFC107" },
  { id: "high", label: "High", color: "#FF9800" },
  { id: "very_high", label: "Very High", color: "#F44336" },
] as const;

type WorkoutType = typeof WORKOUT_TYPES[number]["id"];
type IntensityLevel = typeof INTENSITY_LEVELS[number]["id"];

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  weightUnit?: string;
  duration?: number;
  distance?: number;
  distanceUnit?: string;
}

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkoutType>("strength");
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [intensity, setIntensity] = useState<IntensityLevel>("moderate");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise>({ name: "" });

  const utils = trpc.useUtils();
  const { data: workouts, isLoading } = trpc.workouts.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: weeklyStats } = trpc.workouts.weeklyStats.useQuery(undefined, { enabled: isAuthenticated });
  const createWorkout = trpc.workouts.create.useMutation({
    onSuccess: () => {
      utils.workouts.list.invalidate();
      utils.workouts.weeklyStats.invalidate();
      resetForm();
      setShowAddModal(false);
    },
  });
  const deleteWorkout = trpc.workouts.delete.useMutation({
    onSuccess: () => {
      utils.workouts.list.invalidate();
      utils.workouts.weeklyStats.invalidate();
    },
  });

  const resetForm = () => {
    setSelectedType("strength");
    setWorkoutName("");
    setDuration("");
    setCalories("");
    setIntensity("moderate");
    setNotes("");
    setExercises([]);
  };

  const handleAddWorkout = () => {
    const today = new Date().toISOString().split("T")[0];
    createWorkout.mutate({
      workoutDate: today,
      workoutType: selectedType,
      name: workoutName || undefined,
      durationMinutes: duration ? parseInt(duration) : undefined,
      caloriesBurned: calories ? parseInt(calories) : undefined,
      intensity,
      exercises: exercises.length > 0 ? exercises : undefined,
      notes: notes || undefined,
    });
  };

  const handleAddExercise = () => {
    if (currentExercise.name) {
      setExercises([...exercises, currentExercise]);
      setCurrentExercise({ name: "" });
      setShowExerciseModal(false);
    }
  };

  const getWorkoutIcon = (type: string) => {
    return WORKOUT_TYPES.find((t) => t.id === type)?.icon || "🎯";
  };

  const getIntensityColor = (level: string) => {
    return INTENSITY_LEVELS.find((i) => i.id === level)?.color || colors.textSecondary;
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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
          <ThemedText type="title">Workouts</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your exercise & activity
          </ThemedText>
        </View>

        {/* Weekly Stats */}
        {weeklyStats && (
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>This Week</ThemedText>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: colors.tint }]}>
                  {weeklyStats.totalWorkouts}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Workouts
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: colors.tint }]}>
                  {weeklyStats.totalMinutes}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Minutes
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: colors.tint }]}>
                  {weeklyStats.totalCalories}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Calories
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Add Workout Button */}
        <Pressable
          onPress={() => setShowAddModal(true)}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.tint },
            pressed && styles.buttonPressed,
          ]}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
          <ThemedText type="defaultSemiBold" style={{ color: "#FFFFFF", marginLeft: 8 }}>
            Log Workout
          </ThemedText>
        </Pressable>

        {/* Workout History */}
        <ThemedText type="subtitle" style={{ marginTop: 24, marginBottom: 16 }}>
          Recent Workouts
        </ThemedText>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        )}

        {!isLoading && workouts?.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 48, marginBottom: 12 }}>🏋️</ThemedText>
            <ThemedText type="defaultSemiBold">No workouts yet</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, textAlign: "center", marginTop: 4 }}>
              Start tracking your exercise to see your progress
            </ThemedText>
          </View>
        )}

        {workouts?.map((workout) => (
          <View key={workout.id} style={[styles.workoutCard, { backgroundColor: colors.surface }]}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutIconContainer}>
                <ThemedText style={{ fontSize: 28 }}>{getWorkoutIcon(workout.workoutType)}</ThemedText>
              </View>
              <View style={styles.workoutInfo}>
                <ThemedText type="defaultSemiBold">
                  {workout.name || WORKOUT_TYPES.find((t) => t.id === workout.workoutType)?.label || "Workout"}
                </ThemedText>
                <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
                  {formatDate(workout.workoutDate)}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => deleteWorkout.mutate({ id: workout.id })}
                style={styles.deleteButton}
              >
                <IconSymbol name="trash.fill" size={18} color={colors.error} />
              </Pressable>
            </View>

            <View style={styles.workoutDetails}>
              {workout.durationMinutes && (
                <View style={styles.detailChip}>
                  <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                    ⏱️ {workout.durationMinutes} min
                  </ThemedText>
                </View>
              )}
              {workout.caloriesBurned && (
                <View style={styles.detailChip}>
                  <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                    🔥 {workout.caloriesBurned} cal
                  </ThemedText>
                </View>
              )}
              {workout.intensity && (
                <View style={[styles.detailChip, { backgroundColor: getIntensityColor(workout.intensity) + "20" }]}>
                  <ThemedText style={{ color: getIntensityColor(workout.intensity), fontSize: 12, fontWeight: "600" }}>
                    {INTENSITY_LEVELS.find((i) => i.id === workout.intensity)?.label}
                  </ThemedText>
                </View>
              )}
            </View>

            {workout.exercises && workout.exercises.length > 0 && (
              <View style={[styles.exerciseList, { borderTopColor: colors.border }]}>
                {workout.exercises.map((ex, idx) => (
                  <ThemedText key={idx} style={{ color: colors.textSecondary, fontSize: 13 }}>
                    • {ex.name}
                    {ex.sets && ex.reps ? ` - ${ex.sets}×${ex.reps}` : ""}
                    {ex.weight ? ` @ ${ex.weight}${ex.weightUnit || "lbs"}` : ""}
                    {ex.duration ? ` - ${ex.duration}min` : ""}
                  </ThemedText>
                ))}
              </View>
            )}

            {workout.notes && (
              <ThemedText style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8, fontStyle: "italic" }}>
                {workout.notes}
              </ThemedText>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Add Workout Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText type="subtitle">Log Workout</ThemedText>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <ThemedText style={{ color: colors.tint, fontSize: 16 }}>Cancel</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Workout Type */}
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Type</ThemedText>
              <View style={styles.typeGrid}>
                {WORKOUT_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    onPress={() => setSelectedType(type.id)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: selectedType === type.id ? colors.tint : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText style={{ fontSize: 20 }}>{type.icon}</ThemedText>
                    <ThemedText
                      style={{
                        color: selectedType === type.id ? "#FFFFFF" : colors.text,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {type.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Workout Name */}
              <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 8 }}>
                Name (optional)
              </ThemedText>
              <TextInput
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="e.g., Morning Run, Leg Day"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              />

              {/* Duration & Calories */}
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <ThemedText type="defaultSemiBold" style={{ marginTop: 16, marginBottom: 8 }}>
                    Duration (min)
                  </ThemedText>
                  <TextInput
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="30"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <ThemedText type="defaultSemiBold" style={{ marginTop: 16, marginBottom: 8 }}>
                    Calories
                  </ThemedText>
                  <TextInput
                    value={calories}
                    onChangeText={setCalories}
                    placeholder="200"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  />
                </View>
              </View>

              {/* Intensity */}
              <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 12 }}>
                Intensity
              </ThemedText>
              <View style={styles.intensityRow}>
                {INTENSITY_LEVELS.map((level) => (
                  <Pressable
                    key={level.id}
                    onPress={() => setIntensity(level.id)}
                    style={[
                      styles.intensityChip,
                      {
                        backgroundColor: intensity === level.id ? level.color : colors.surface,
                        borderColor: level.color,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: intensity === level.id ? "#FFFFFF" : level.color,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {level.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Exercises */}
              <View style={styles.exercisesHeader}>
                <ThemedText type="defaultSemiBold">Exercises</ThemedText>
                <Pressable onPress={() => setShowExerciseModal(true)}>
                  <ThemedText style={{ color: colors.tint }}>+ Add</ThemedText>
                </Pressable>
              </View>
              {exercises.map((ex, idx) => (
                <View key={idx} style={[styles.exerciseItem, { backgroundColor: colors.surface }]}>
                  <ThemedText>{ex.name}</ThemedText>
                  <Pressable onPress={() => setExercises(exercises.filter((_, i) => i !== idx))}>
                    <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ))}

              {/* Notes */}
              <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 8 }}>
                Notes
              </ThemedText>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="How did it feel?"
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              />

              {/* Save Button */}
              <Pressable
                onPress={handleAddWorkout}
                disabled={createWorkout.isPending}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: colors.tint },
                  pressed && styles.buttonPressed,
                  createWorkout.isPending && styles.buttonDisabled,
                ]}
              >
                {createWorkout.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="defaultSemiBold" style={{ color: "#FFFFFF" }}>
                    Save Workout
                  </ThemedText>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal visible={showExerciseModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.exerciseModal, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>Add Exercise</ThemedText>
            
            <TextInput
              value={currentExercise.name}
              onChangeText={(text) => setCurrentExercise({ ...currentExercise, name: text })}
              placeholder="Exercise name"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 4 }}>
                <TextInput
                  value={currentExercise.sets?.toString() || ""}
                  onChangeText={(text) => setCurrentExercise({ ...currentExercise, sets: text ? parseInt(text) : undefined })}
                  placeholder="Sets"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 4 }}>
                <TextInput
                  value={currentExercise.reps?.toString() || ""}
                  onChangeText={(text) => setCurrentExercise({ ...currentExercise, reps: text ? parseInt(text) : undefined })}
                  placeholder="Reps"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <TextInput
                  value={currentExercise.weight?.toString() || ""}
                  onChangeText={(text) => setCurrentExercise({ ...currentExercise, weight: text ? parseFloat(text) : undefined })}
                  placeholder="Weight"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
              </View>
            </View>

            <View style={styles.exerciseModalButtons}>
              <Pressable
                onPress={() => { setShowExerciseModal(false); setCurrentExercise({ name: "" }); }}
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleAddExercise}
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
              >
                <ThemedText style={{ color: "#FFFFFF" }}>Add</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { marginBottom: 20 },
  subtitle: { fontSize: 16, marginTop: 4 },
  statsCard: { padding: 20, borderRadius: 16, marginBottom: 20 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 4 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.6 },
  loadingContainer: { alignItems: "center", paddingVertical: 40 },
  emptyCard: { padding: 32, borderRadius: 16, alignItems: "center" },
  workoutCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  workoutHeader: { flexDirection: "row", alignItems: "center" },
  workoutIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" },
  workoutInfo: { flex: 1, marginLeft: 12 },
  deleteButton: { padding: 8 },
  workoutDetails: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  detailChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.05)" },
  exerciseList: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1 },
  modalScroll: { padding: 20 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { width: "23%", aspectRatio: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  intensityRow: { flexDirection: "row", gap: 8 },
  intensityChip: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", borderWidth: 1 },
  exercisesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 12 },
  exerciseItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 8, marginBottom: 8 },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 24, marginBottom: 40 },
  exerciseModal: { margin: 20, padding: 20, borderRadius: 16 },
  exerciseModalButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
});
