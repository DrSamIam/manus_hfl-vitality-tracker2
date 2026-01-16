import { useState, useMemo, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";
import {
  WORKOUT_TEMPLATES,
  EXERCISES,
  WorkoutTemplate,
  Exercise as LibExercise,
  FitnessGoal,
  Difficulty,
  Equipment,
  getExerciseById,
  getTemplatesByGoal,
  getTemplatesByEquipment,
  getTemplatesByDifficulty,
  calculateWorkoutCalories,
} from "@/shared/workout-library";

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

const FITNESS_GOALS = [
  { id: "build_muscle", label: "Build Muscle", icon: "💪", description: "Increase muscle mass and definition" },
  { id: "lose_fat", label: "Lose Fat", icon: "🔥", description: "Burn calories and reduce body fat" },
  { id: "improve_energy", label: "Improve Energy", icon: "⚡", description: "Boost daily energy levels" },
  { id: "reduce_stress", label: "Reduce Stress", icon: "🧘", description: "Lower stress and improve relaxation" },
  { id: "general_fitness", label: "General Fitness", icon: "🏃", description: "Overall health and wellness" },
  { id: "increase_strength", label: "Increase Strength", icon: "🏋️", description: "Get stronger and more powerful" },
] as const;

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner", description: "New to exercise or returning after a long break" },
  { id: "intermediate", label: "Intermediate", description: "Consistent training for 6+ months" },
  { id: "advanced", label: "Advanced", description: "Years of training experience" },
] as const;

const EQUIPMENT_OPTIONS = [
  { id: "bodyweight", label: "Bodyweight", icon: "🏃" },
  { id: "dumbbells", label: "Dumbbells", icon: "🏋️" },
  { id: "barbell", label: "Barbell", icon: "🏋️" },
  { id: "kettlebell", label: "Kettlebell", icon: "🔔" },
  { id: "resistance_bands", label: "Bands", icon: "🎗️" },
  { id: "pull_up_bar", label: "Pull-up Bar", icon: "🔩" },
  { id: "bench", label: "Bench", icon: "🪑" },
  { id: "gym_machine", label: "Gym Machines", icon: "🏢" },
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

type TabType = "templates" | "history" | "exercises";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  
  // Fitness onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Difficulty | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["bodyweight"]);

  // Template workout state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showGuidedWorkout, setShowGuidedWorkout] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});

  // Manual workout state
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
  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: workouts, isLoading } = trpc.workouts.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: weeklyStats } = trpc.workouts.weeklyStats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: recentSymptoms } = trpc.symptoms.list.useQuery({ limit: 7 }, { enabled: isAuthenticated });
  
  // AI recommendation state
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const [aiRecommendation, setAIRecommendation] = useState<{
    recommendation: string;
    suggestedWorkout: {
      name: string;
      type: string;
      duration: number;
      intensity: string;
      exercises: { name: string; sets: number; reps: string; notes?: string }[];
    };
    alternativeOption: string;
    productTip?: string;
  } | null>(null);
  
  const getAIRecommendation = trpc.workouts.getAIRecommendation.useMutation({
    onSuccess: (data) => {
      setAIRecommendation(data);
      setShowAIRecommendation(true);
    },
  });
  
  const createWorkout = trpc.workouts.create.useMutation({
    onSuccess: () => {
      utils.workouts.list.invalidate();
      utils.workouts.weeklyStats.invalidate();
      resetForm();
      setShowAddModal(false);
      setShowGuidedWorkout(false);
      setSelectedTemplate(null);
    },
  });
  const deleteWorkout = trpc.workouts.delete.useMutation({
    onSuccess: () => {
      utils.workouts.list.invalidate();
      utils.workouts.weeklyStats.invalidate();
    },
  });
  const updateFitnessPreferences = trpc.profile.updateFitnessPreferences.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate();
      setShowOnboarding(false);
    },
  });

  // Check if fitness onboarding is needed
  useEffect(() => {
    if (profile && !profile.fitnessOnboardingCompleted && isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [profile, isAuthenticated]);

  // Rest timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  // Filter templates based on user preferences
  const filteredTemplates = useMemo(() => {
    let templates = [...WORKOUT_TEMPLATES];
    
    if (profile?.fitnessGoal) {
      const goalTemplates = getTemplatesByGoal(profile.fitnessGoal as FitnessGoal);
      if (goalTemplates.length > 0) {
        // Prioritize goal-matching templates but include others
        templates = [
          ...goalTemplates,
          ...templates.filter(t => !goalTemplates.includes(t)),
        ];
      }
    }
    
    if (profile?.fitnessExperience) {
      templates = templates.filter(t => 
        t.difficulty === profile.fitnessExperience || 
        (profile.fitnessExperience === "advanced") ||
        (profile.fitnessExperience === "intermediate" && t.difficulty !== "advanced")
      );
    }
    
    return templates;
  }, [profile]);

  // Get smart recommendation based on recent symptoms
  const smartRecommendation = useMemo(() => {
    if (!recentSymptoms || recentSymptoms.length === 0) return null;
    
    const avgEnergy = recentSymptoms.reduce((sum, s) => sum + (s.energy || 5), 0) / recentSymptoms.length;
    const avgMood = recentSymptoms.reduce((sum, s) => sum + (s.mood || 5), 0) / recentSymptoms.length;
    
    if (avgEnergy < 4) {
      return {
        message: "Your energy has been low lately. Try a gentle workout to boost your mood without overexertion.",
        templates: WORKOUT_TEMPLATES.filter(t => t.id === "morning_energy" || t.id === "recovery_mobility" || t.id === "stress_relief"),
      };
    }
    
    if (avgMood < 4) {
      return {
        message: "Feeling stressed? These workouts can help improve your mood and reduce tension.",
        templates: WORKOUT_TEMPLATES.filter(t => t.id === "stress_relief" || t.id === "evening_winddown" || t.id === "yoga"),
      };
    }
    
    if (avgEnergy >= 7) {
      return {
        message: "Great energy levels! You're ready for a challenging workout.",
        templates: WORKOUT_TEMPLATES.filter(t => t.difficulty === "intermediate" && (t.type === "strength" || t.type === "hiit")),
      };
    }
    
    return null;
  }, [recentSymptoms]);

  const resetForm = () => {
    setSelectedType("strength");
    setWorkoutName("");
    setDuration("");
    setCalories("");
    setIntensity("moderate");
    setNotes("");
    setExercises([]);
    setCompletedSets({});
    setCurrentExerciseIndex(0);
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

  const handleCompleteTemplateWorkout = () => {
    if (!selectedTemplate) return;
    
    const today = new Date().toISOString().split("T")[0];
    const exerciseList = selectedTemplate.exercises.map(te => {
      const exercise = getExerciseById(te.exerciseId);
      return {
        name: exercise?.name || te.exerciseId,
        sets: te.sets,
        reps: parseInt(te.reps) || undefined,
        duration: te.reps.includes("sec") ? parseInt(te.reps) : undefined,
      };
    });
    
    createWorkout.mutate({
      workoutDate: today,
      workoutType: selectedTemplate.type as WorkoutType,
      name: selectedTemplate.name,
      durationMinutes: selectedTemplate.duration,
      caloriesBurned: calculateWorkoutCalories(selectedTemplate),
      intensity: selectedTemplate.difficulty === "beginner" ? "low" : selectedTemplate.difficulty === "intermediate" ? "moderate" : "high",
      exercises: exerciseList,
      notes: `Completed ${selectedTemplate.name} template workout`,
    });
  };

  const handleAddExercise = () => {
    if (currentExercise.name) {
      setExercises([...exercises, currentExercise]);
      setCurrentExercise({ name: "" });
      setShowExerciseModal(false);
    }
  };

  const handleCompleteSet = (exerciseId: string, restSeconds: number) => {
    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || 0) + 1,
    }));
    setRestTimer(restSeconds);
    setIsResting(true);
  };

  const handleFinishOnboarding = () => {
    if (selectedGoal && selectedExperience) {
      updateFitnessPreferences.mutate({
        fitnessGoal: selectedGoal,
        fitnessExperience: selectedExperience,
        availableEquipment: selectedEquipment,
        fitnessOnboardingCompleted: true,
      });
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "beginner": return "#4CAF50";
      case "intermediate": return "#FFC107";
      case "advanced": return "#F44336";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "strength": return "💪";
      case "cardio": return "🏃";
      case "hiit": return "⚡";
      case "yoga": return "🧘";
      case "mobility": return "🤸";
      case "circuit": return "🔄";
      case "stretching": return "🧘";
      default: return "🏋️";
    }
  };

  // Render template card
  const renderTemplateCard = (template: WorkoutTemplate) => (
    <Pressable
      key={template.id}
      onPress={() => {
        setSelectedTemplate(template);
        setShowTemplateModal(true);
      }}
      style={({ pressed }) => [
        styles.templateCard,
        { backgroundColor: colors.surface },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.templateHeader}>
        <View style={[styles.templateIcon, { backgroundColor: getDifficultyColor(template.difficulty) + "20" }]}>
          <ThemedText style={{ fontSize: 24 }}>{getTypeIcon(template.type)}</ThemedText>
        </View>
        <View style={styles.templateInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>{template.name}</ThemedText>
          <View style={styles.templateMeta}>
            <ThemedText style={[styles.templateMetaText, { color: colors.textSecondary }]}>
              {template.duration} min
            </ThemedText>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(template.difficulty) + "20" }]}>
              <ThemedText style={[styles.difficultyText, { color: getDifficultyColor(template.difficulty) }]}>
                {template.difficulty}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
      <ThemedText style={[styles.templateDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {template.description}
      </ThemedText>
    </Pressable>
  );

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
            Templates, tracking & exercise library
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

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          {(["templates", "history", "exercises"] as TabType[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.tint },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? "#FFFFFF" : colors.textSecondary },
                ]}
              >
                {tab === "templates" ? "Templates" : tab === "history" ? "History" : "Exercises"}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Smart Recommendation */}
        {activeTab === "templates" && smartRecommendation && (
          <View style={[styles.recommendationCard, { backgroundColor: colors.tint + "15", borderColor: colors.tint }]}>
            <View style={styles.recommendationHeader}>
              <ThemedText style={{ fontSize: 20 }}>💡</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ marginLeft: 8, flex: 1 }}>
                Dr. Sam's Recommendation
              </ThemedText>
            </View>
            <ThemedText style={[styles.recommendationText, { color: colors.text }]}>
              {smartRecommendation.message}
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {smartRecommendation.templates.map((template) => (
                <Pressable
                  key={template.id}
                  onPress={() => {
                    setSelectedTemplate(template);
                    setShowTemplateModal(true);
                  }}
                  style={[styles.miniTemplateCard, { backgroundColor: colors.surface }]}
                >
                  <ThemedText style={{ fontSize: 20 }}>{getTypeIcon(template.type)}</ThemedText>
                  <ThemedText style={{ fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                    {template.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <>
            {/* AI Recommendation Button */}
            <Pressable
              onPress={() => getAIRecommendation.mutate()}
              disabled={getAIRecommendation.isPending}
              style={({ pressed }) => [
                styles.aiRecommendButton,
                { backgroundColor: colors.tint },
                pressed && { opacity: 0.8 },
                getAIRecommendation.isPending && { opacity: 0.6 },
              ]}
            >
              {getAIRecommendation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <ThemedText style={{ fontSize: 20, marginRight: 8 }}>🤖</ThemedText>
                  <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Get AI Workout Recommendation
                  </ThemedText>
                </>
              )}
            </Pressable>
            
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Workout Templates</ThemedText>
              {!profile?.fitnessOnboardingCompleted && (
                <Pressable onPress={() => setShowOnboarding(true)}>
                  <ThemedText style={{ color: colors.tint, fontSize: 14 }}>Set Preferences</ThemedText>
                </Pressable>
              )}
            </View>
            
            {filteredTemplates.map(renderTemplateCard)}
            
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={[styles.customWorkoutButton, { borderColor: colors.tint }]}
            >
              <IconSymbol name="plus" size={20} color={colors.tint} />
              <ThemedText style={{ color: colors.tint, marginLeft: 8 }}>
                Log Custom Workout
              </ThemedText>
            </Pressable>
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <>
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
                    {workout.exercises.slice(0, 3).map((ex, idx) => (
                      <ThemedText key={idx} style={{ color: colors.textSecondary, fontSize: 13 }}>
                        • {ex.name} {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ""}
                        {ex.weight ? ` @ ${ex.weight}${ex.weightUnit || "lbs"}` : ""}
                      </ThemedText>
                    ))}
                    {workout.exercises.length > 3 && (
                      <ThemedText style={{ color: colors.textSecondary, fontSize: 13, fontStyle: "italic" }}>
                        +{workout.exercises.length - 3} more exercises
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Exercises Tab */}
        {activeTab === "exercises" && (
          <>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Exercise Library
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary, marginBottom: 16 }}>
              Browse {EXERCISES.length} exercises with instructions and tips
            </ThemedText>
            
            {EXERCISES.map((exercise) => (
              <View key={exercise.id} style={[styles.exerciseCard, { backgroundColor: colors.surface }]}>
                <View style={styles.exerciseHeader}>
                  <ThemedText type="defaultSemiBold">{exercise.name}</ThemedText>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + "20" }]}>
                    <ThemedText style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                      {exercise.difficulty}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                  {exercise.primaryMuscles.join(", ")}
                </ThemedText>
                <ThemedText style={{ fontSize: 14, marginTop: 8, lineHeight: 20 }}>
                  {exercise.instructions}
                </ThemedText>
                {exercise.tips.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    {exercise.tips.map((tip, idx) => (
                      <ThemedText key={idx} style={{ color: colors.tint, fontSize: 13 }}>
                        💡 {tip}
                      </ThemedText>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Template Detail Modal */}
      <Modal visible={showTemplateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText type="subtitle">{selectedTemplate?.name}</ThemedText>
              <Pressable onPress={() => setShowTemplateModal(false)}>
                <IconSymbol name="chevron.right" size={24} color={colors.text} style={{ transform: [{ rotate: "90deg" }] }} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {selectedTemplate && (
                <>
                  <View style={styles.templateDetailHeader}>
                    <View style={[styles.templateDetailIcon, { backgroundColor: getDifficultyColor(selectedTemplate.difficulty) + "20" }]}>
                      <ThemedText style={{ fontSize: 40 }}>{getTypeIcon(selectedTemplate.type)}</ThemedText>
                    </View>
                    <ThemedText style={{ color: colors.textSecondary, marginTop: 12, textAlign: "center" }}>
                      {selectedTemplate.description}
                    </ThemedText>
                    <View style={styles.templateStats}>
                      <View style={styles.templateStat}>
                        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>{selectedTemplate.duration}</ThemedText>
                        <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>minutes</ThemedText>
                      </View>
                      <View style={styles.templateStat}>
                        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>{selectedTemplate.exercises.length}</ThemedText>
                        <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>exercises</ThemedText>
                      </View>
                      <View style={styles.templateStat}>
                        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>{calculateWorkoutCalories(selectedTemplate)}</ThemedText>
                        <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>calories</ThemedText>
                      </View>
                    </View>
                  </View>

                  {selectedTemplate.warmup && selectedTemplate.warmup.length > 0 && (
                    <>
                      <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 12 }}>
                        Warm-up
                      </ThemedText>
                      {selectedTemplate.warmup.map((te, idx) => {
                        const exercise = getExerciseById(te.exerciseId);
                        return (
                          <View key={idx} style={[styles.exerciseRow, { backgroundColor: colors.surface }]}>
                            <ThemedText>{exercise?.name || te.exerciseId}</ThemedText>
                            <ThemedText style={{ color: colors.textSecondary }}>
                              {te.sets}×{te.reps}
                            </ThemedText>
                          </View>
                        );
                      })}
                    </>
                  )}

                  <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 12 }}>
                    Main Workout
                  </ThemedText>
                  {selectedTemplate.exercises.map((te, idx) => {
                    const exercise = getExerciseById(te.exerciseId);
                    return (
                      <View key={idx} style={[styles.exerciseRow, { backgroundColor: colors.surface }]}>
                        <View style={{ flex: 1 }}>
                          <ThemedText>{exercise?.name || te.exerciseId}</ThemedText>
                          {te.notes && (
                            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>{te.notes}</ThemedText>
                          )}
                        </View>
                        <ThemedText style={{ color: colors.textSecondary }}>
                          {te.sets}×{te.reps}
                        </ThemedText>
                      </View>
                    );
                  })}

                  {selectedTemplate.cooldown && selectedTemplate.cooldown.length > 0 && (
                    <>
                      <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 12 }}>
                        Cool-down
                      </ThemedText>
                      {selectedTemplate.cooldown.map((te, idx) => {
                        const exercise = getExerciseById(te.exerciseId);
                        return (
                          <View key={idx} style={[styles.exerciseRow, { backgroundColor: colors.surface }]}>
                            <ThemedText>{exercise?.name || te.exerciseId}</ThemedText>
                            <ThemedText style={{ color: colors.textSecondary }}>
                              {te.sets}×{te.reps}
                            </ThemedText>
                          </View>
                        );
                      })}
                    </>
                  )}

                  {selectedTemplate.hflProductTip && (
                    <View style={[styles.productTip, { backgroundColor: colors.tint + "15", borderColor: colors.tint }]}>
                      <ThemedText style={{ fontSize: 16 }}>💊</ThemedText>
                      <ThemedText style={{ flex: 1, marginLeft: 8, fontSize: 13 }}>
                        {selectedTemplate.hflProductTip}
                      </ThemedText>
                    </View>
                  )}

                  <View style={styles.templateActions}>
                    <Pressable
                      onPress={() => {
                        setShowTemplateModal(false);
                        setShowGuidedWorkout(true);
                        setCurrentExerciseIndex(0);
                        setCompletedSets({});
                      }}
                      style={[styles.startButton, { backgroundColor: colors.tint }]}
                    >
                      <ThemedText style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
                        Start Guided Workout
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        handleCompleteTemplateWorkout();
                        setShowTemplateModal(false);
                      }}
                      style={[styles.quickLogButton, { borderColor: colors.tint }]}
                    >
                      <ThemedText style={{ color: colors.tint }}>
                        Quick Log (Mark Complete)
                      </ThemedText>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Guided Workout Modal */}
      <Modal visible={showGuidedWorkout} animationType="slide">
        <ThemedView style={[styles.guidedContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {selectedTemplate && (
            <>
              <View style={styles.guidedHeader}>
                <Pressable onPress={() => setShowGuidedWorkout(false)}>
                  <ThemedText style={{ color: colors.error }}>End Workout</ThemedText>
                </Pressable>
                <ThemedText type="defaultSemiBold">{selectedTemplate.name}</ThemedText>
                <ThemedText style={{ color: colors.textSecondary }}>
                  {currentExerciseIndex + 1}/{selectedTemplate.exercises.length}
                </ThemedText>
              </View>

              {isResting ? (
                <View style={styles.restScreen}>
                  <ThemedText style={{ fontSize: 24, marginBottom: 8 }}>Rest</ThemedText>
                  <ThemedText style={{ fontSize: 72, fontWeight: "bold", color: colors.tint }}>
                    {formatTime(restTimer)}
                  </ThemedText>
                  <Pressable
                    onPress={() => { setIsResting(false); setRestTimer(0); }}
                    style={[styles.skipButton, { backgroundColor: colors.surface }]}
                  >
                    <ThemedText>Skip Rest</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                  {(() => {
                    const te = selectedTemplate.exercises[currentExerciseIndex];
                    const exercise = getExerciseById(te.exerciseId);
                    const setsCompleted = completedSets[te.exerciseId] || 0;
                    
                    return (
                      <View style={styles.currentExercise}>
                        <ThemedText style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>
                          {getTypeIcon(selectedTemplate.type)}
                        </ThemedText>
                        <ThemedText type="title" style={{ textAlign: "center" }}>
                          {exercise?.name || te.exerciseId}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 24, textAlign: "center", color: colors.tint, marginTop: 8 }}>
                          {te.sets} sets × {te.reps}
                        </ThemedText>
                        
                        <View style={styles.setsProgress}>
                          {Array.from({ length: te.sets }).map((_, idx) => (
                            <View
                              key={idx}
                              style={[
                                styles.setDot,
                                { backgroundColor: idx < setsCompleted ? colors.tint : colors.surface },
                              ]}
                            />
                          ))}
                        </View>
                        
                        <ThemedText style={{ color: colors.textSecondary, textAlign: "center", marginTop: 16, lineHeight: 22 }}>
                          {exercise?.instructions}
                        </ThemedText>
                        
                        {setsCompleted < te.sets ? (
                          <Pressable
                            onPress={() => handleCompleteSet(te.exerciseId, te.restSeconds)}
                            style={[styles.completeSetButton, { backgroundColor: colors.tint }]}
                          >
                            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 18 }}>
                              Complete Set {setsCompleted + 1}
                            </ThemedText>
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => {
                              if (currentExerciseIndex < selectedTemplate.exercises.length - 1) {
                                setCurrentExerciseIndex(currentExerciseIndex + 1);
                              } else {
                                handleCompleteTemplateWorkout();
                              }
                            }}
                            style={[styles.completeSetButton, { backgroundColor: "#4CAF50" }]}
                          >
                            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 18 }}>
                              {currentExerciseIndex < selectedTemplate.exercises.length - 1 ? "Next Exercise" : "Finish Workout"}
                            </ThemedText>
                          </Pressable>
                        )}
                      </View>
                    );
                  })()}
                </ScrollView>
              )}
            </>
          )}
        </ThemedView>
      </Modal>

      {/* Fitness Onboarding Modal */}
      <Modal visible={showOnboarding} animationType="slide">
        <ThemedView style={[styles.onboardingContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.onboardingHeader}>
            <ThemedText type="title">Set Your Fitness Preferences</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, marginTop: 8 }}>
              Help us personalize your workout recommendations
            </ThemedText>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {onboardingStep === 0 && (
              <>
                <ThemedText type="subtitle" style={{ marginBottom: 16 }}>What's your main fitness goal?</ThemedText>
                {FITNESS_GOALS.map((goal) => (
                  <Pressable
                    key={goal.id}
                    onPress={() => setSelectedGoal(goal.id as FitnessGoal)}
                    style={[
                      styles.goalOption,
                      { backgroundColor: colors.surface, borderColor: selectedGoal === goal.id ? colors.tint : colors.border },
                      selectedGoal === goal.id && { borderWidth: 2 },
                    ]}
                  >
                    <ThemedText style={{ fontSize: 28 }}>{goal.icon}</ThemedText>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <ThemedText type="defaultSemiBold">{goal.label}</ThemedText>
                      <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>{goal.description}</ThemedText>
                    </View>
                  </Pressable>
                ))}
              </>
            )}

            {onboardingStep === 1 && (
              <>
                <ThemedText type="subtitle" style={{ marginBottom: 16 }}>What's your experience level?</ThemedText>
                {EXPERIENCE_LEVELS.map((level) => (
                  <Pressable
                    key={level.id}
                    onPress={() => setSelectedExperience(level.id as Difficulty)}
                    style={[
                      styles.goalOption,
                      { backgroundColor: colors.surface, borderColor: selectedExperience === level.id ? colors.tint : colors.border },
                      selectedExperience === level.id && { borderWidth: 2 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{level.label}</ThemedText>
                      <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>{level.description}</ThemedText>
                    </View>
                  </Pressable>
                ))}
              </>
            )}

            {onboardingStep === 2 && (
              <>
                <ThemedText type="subtitle" style={{ marginBottom: 16 }}>What equipment do you have?</ThemedText>
                <ThemedText style={{ color: colors.textSecondary, marginBottom: 16 }}>Select all that apply</ThemedText>
                <View style={styles.equipmentGrid}>
                  {EQUIPMENT_OPTIONS.map((equip) => (
                    <Pressable
                      key={equip.id}
                      onPress={() => {
                        if (selectedEquipment.includes(equip.id)) {
                          setSelectedEquipment(selectedEquipment.filter(e => e !== equip.id));
                        } else {
                          setSelectedEquipment([...selectedEquipment, equip.id]);
                        }
                      }}
                      style={[
                        styles.equipmentOption,
                        { backgroundColor: colors.surface, borderColor: selectedEquipment.includes(equip.id) ? colors.tint : colors.border },
                        selectedEquipment.includes(equip.id) && { borderWidth: 2 },
                      ]}
                    >
                      <ThemedText style={{ fontSize: 24 }}>{equip.icon}</ThemedText>
                      <ThemedText style={{ fontSize: 12, marginTop: 4 }}>{equip.label}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={[styles.onboardingFooter, { borderTopColor: colors.border }]}>
            {onboardingStep > 0 && (
              <Pressable
                onPress={() => setOnboardingStep(onboardingStep - 1)}
                style={[styles.onboardingButton, { backgroundColor: colors.surface }]}
              >
                <ThemedText>Back</ThemedText>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                if (onboardingStep < 2) {
                  setOnboardingStep(onboardingStep + 1);
                } else {
                  handleFinishOnboarding();
                }
              }}
              disabled={
                (onboardingStep === 0 && !selectedGoal) ||
                (onboardingStep === 1 && !selectedExperience)
              }
              style={[
                styles.onboardingButton,
                { backgroundColor: colors.tint, flex: onboardingStep === 0 ? 1 : undefined },
                ((onboardingStep === 0 && !selectedGoal) || (onboardingStep === 1 && !selectedExperience)) && { opacity: 0.5 },
              ]}
            >
              <ThemedText style={{ color: "#FFFFFF" }}>
                {onboardingStep < 2 ? "Continue" : "Finish Setup"}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </Modal>

      {/* Add Manual Workout Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText type="subtitle">Log Workout</ThemedText>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <IconSymbol name="chevron.right" size={24} color={colors.text} style={{ transform: [{ rotate: "90deg" }] }} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Workout Type</ThemedText>
              <View style={styles.typeGrid}>
                {WORKOUT_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    onPress={() => setSelectedType(type.id)}
                    style={[
                      styles.typeChip,
                      { backgroundColor: colors.surface, borderColor: selectedType === type.id ? colors.tint : colors.border },
                      selectedType === type.id && { borderWidth: 2 },
                    ]}
                  >
                    <ThemedText style={{ fontSize: 24 }}>{type.icon}</ThemedText>
                    <ThemedText style={{ fontSize: 11, marginTop: 4 }}>{type.label}</ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 12 }}>Details</ThemedText>
              <TextInput
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Workout name (optional)"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              />

              <View style={[styles.row, { gap: 12, marginTop: 12 }]}>
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Duration (min)"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="Calories"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
              </View>

              <ThemedText type="defaultSemiBold" style={{ marginTop: 20, marginBottom: 12 }}>Intensity</ThemedText>
              <View style={styles.intensityRow}>
                {INTENSITY_LEVELS.map((level) => (
                  <Pressable
                    key={level.id}
                    onPress={() => setIntensity(level.id)}
                    style={[
                      styles.intensityChip,
                      { backgroundColor: intensity === level.id ? level.color + "30" : colors.surface, borderColor: intensity === level.id ? level.color : colors.border },
                    ]}
                  >
                    <ThemedText style={{ color: intensity === level.id ? level.color : colors.text, fontSize: 12, fontWeight: "600" }}>
                      {level.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <View style={styles.exercisesHeader}>
                <ThemedText type="defaultSemiBold">Exercises</ThemedText>
                <Pressable onPress={() => setShowExerciseModal(true)}>
                  <ThemedText style={{ color: colors.tint }}>+ Add</ThemedText>
                </Pressable>
              </View>

              {exercises.map((ex, idx) => (
                <View key={idx} style={[styles.exerciseItem, { backgroundColor: colors.surface }]}>
                  <View>
                    <ThemedText>{ex.name}</ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ""}
                      {ex.weight ? ` @ ${ex.weight} lbs` : ""}
                      {ex.duration ? `${ex.duration} min` : ""}
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => setExercises(exercises.filter((_, i) => i !== idx))}>
                    <IconSymbol name="trash.fill" size={16} color={colors.error} />
                  </Pressable>
                </View>
              ))}

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes (optional)"
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, styles.textArea, { marginTop: 16, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              />

              <Pressable
                onPress={handleAddWorkout}
                disabled={createWorkout.isPending}
                style={[styles.saveButton, { backgroundColor: colors.tint }, createWorkout.isPending && styles.buttonDisabled]}
              >
                {createWorkout.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>Save Workout</ThemedText>
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

            <View style={[styles.row, { gap: 12, marginTop: 12 }]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={currentExercise.sets?.toString() || ""}
                  onChangeText={(text) => setCurrentExercise({ ...currentExercise, sets: text ? parseInt(text) : undefined })}
                  placeholder="Sets"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={currentExercise.reps?.toString() || ""}
                  onChangeText={(text) => setCurrentExercise({ ...currentExercise, reps: text ? parseInt(text) : undefined })}
                  placeholder="Reps"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
              </View>
              <View style={{ flex: 1 }}>
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

      {/* AI Recommendation Modal */}
      <Modal visible={showAIRecommendation} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText type="subtitle">🤖 AI Workout Recommendation</ThemedText>
              <Pressable onPress={() => setShowAIRecommendation(false)}>
                <IconSymbol name="chevron.right" size={24} color={colors.text} style={{ transform: [{ rotate: "90deg" }] }} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {aiRecommendation && (
                <>
                  <View style={[styles.aiRecommendCard, { backgroundColor: colors.tint + "15" }]}>
                    <ThemedText style={{ lineHeight: 22 }}>
                      {aiRecommendation.recommendation}
                    </ThemedText>
                  </View>
                  
                  <View style={[styles.aiWorkoutCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.aiWorkoutHeader}>
                      <ThemedText style={{ fontSize: 32 }}>{getTypeIcon(aiRecommendation.suggestedWorkout.type)}</ThemedText>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <ThemedText type="subtitle">{aiRecommendation.suggestedWorkout.name}</ThemedText>
                        <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                          <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
                            ⏱️ {aiRecommendation.suggestedWorkout.duration} min
                          </ThemedText>
                          <ThemedText style={{ color: colors.textSecondary, fontSize: 13, textTransform: "capitalize" }}>
                            {aiRecommendation.suggestedWorkout.intensity} intensity
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    
                    <ThemedText type="defaultSemiBold" style={{ marginTop: 16, marginBottom: 12 }}>Exercises</ThemedText>
                    {aiRecommendation.suggestedWorkout.exercises.map((ex, idx) => (
                      <View key={idx} style={[styles.aiExerciseRow, { borderBottomColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                          <ThemedText>{ex.name}</ThemedText>
                          {ex.notes && (
                            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>{ex.notes}</ThemedText>
                          )}
                        </View>
                        <ThemedText style={{ color: colors.tint, fontWeight: "600" }}>
                          {ex.sets}×{ex.reps}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                  
                  {aiRecommendation.alternativeOption && (
                    <View style={[styles.alternativeCard, { backgroundColor: colors.surface }]}>
                      <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>💡 Alternative Option</ThemedText>
                      <ThemedText style={{ color: colors.textSecondary, lineHeight: 20 }}>
                        {aiRecommendation.alternativeOption}
                      </ThemedText>
                    </View>
                  )}
                  
                  {aiRecommendation.productTip && (
                    <View style={[styles.productTip, { backgroundColor: colors.tint + "15", borderColor: colors.tint }]}>
                      <ThemedText style={{ fontSize: 16 }}>💊</ThemedText>
                      <ThemedText style={{ flex: 1, marginLeft: 8, fontSize: 13 }}>
                        {aiRecommendation.productTip}
                      </ThemedText>
                    </View>
                  )}
                  
                  <Pressable
                    onPress={() => {
                      // Log this AI-recommended workout
                      const today = new Date().toISOString().split("T")[0];
                      createWorkout.mutate({
                        workoutDate: today,
                        workoutType: aiRecommendation.suggestedWorkout.type as WorkoutType,
                        name: aiRecommendation.suggestedWorkout.name,
                        durationMinutes: aiRecommendation.suggestedWorkout.duration,
                        intensity: aiRecommendation.suggestedWorkout.intensity as IntensityLevel,
                        exercises: aiRecommendation.suggestedWorkout.exercises.map(ex => ({
                          name: ex.name,
                          sets: ex.sets,
                          reps: parseInt(ex.reps) || undefined,
                        })),
                        notes: "AI-recommended workout",
                      });
                      setShowAIRecommendation(false);
                    }}
                    style={[styles.startButton, { backgroundColor: colors.tint, marginTop: 20, marginBottom: 40 }]}
                  >
                    <ThemedText style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
                      Start This Workout
                    </ThemedText>
                  </Pressable>
                </>
              )}
            </ScrollView>
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
  
  // Tabs
  tabContainer: { flexDirection: "row", borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
  
  // Recommendation
  recommendationCard: { padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1 },
  recommendationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  recommendationText: { fontSize: 14, lineHeight: 20 },
  miniTemplateCard: { padding: 12, borderRadius: 8, marginRight: 12, alignItems: "center", minWidth: 80 },
  
  // AI Recommendation
  aiRecommendButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 12, marginBottom: 20 },
  aiRecommendCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  aiWorkoutCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  aiWorkoutHeader: { flexDirection: "row", alignItems: "center" },
  aiExerciseRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  alternativeCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  
  // Templates
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  templateCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  templateHeader: { flexDirection: "row", alignItems: "center" },
  templateIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  templateInfo: { flex: 1, marginLeft: 12 },
  templateMeta: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  templateMetaText: { fontSize: 13 },
  templateDescription: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  difficultyText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  customWorkoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", marginTop: 8 },
  
  // Template Detail
  templateDetailHeader: { alignItems: "center", paddingVertical: 20 },
  templateDetailIcon: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  templateStats: { flexDirection: "row", marginTop: 20, gap: 32 },
  templateStat: { alignItems: "center" },
  exerciseRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 8, marginBottom: 8 },
  productTip: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, marginTop: 20, borderWidth: 1 },
  templateActions: { marginTop: 24, marginBottom: 40, gap: 12 },
  startButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  quickLogButton: { paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  
  // Guided Workout
  guidedContainer: { flex: 1 },
  guidedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  restScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  skipButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 },
  currentExercise: { alignItems: "center", paddingVertical: 20 },
  setsProgress: { flexDirection: "row", gap: 8, marginTop: 16 },
  setDot: { width: 16, height: 16, borderRadius: 8 },
  completeSetButton: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, marginTop: 32 },
  
  // Onboarding
  onboardingContainer: { flex: 1 },
  onboardingHeader: { padding: 20 },
  goalOption: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  equipmentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  equipmentOption: { width: "30%", aspectRatio: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  onboardingFooter: { flexDirection: "row", padding: 20, gap: 12, borderTopWidth: 1 },
  onboardingButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  
  // Exercise Library
  exerciseCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  // Existing styles
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12 },
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
