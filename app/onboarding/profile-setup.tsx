import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

const MALE_GOALS = [
  "Optimize testosterone",
  "Improve libido & sexual performance",
  "Increase energy & reduce fatigue",
  "Better sleep & recovery",
  "Build muscle & lose fat",
  "Improve mood & mental clarity",
];

const FEMALE_GOALS = [
  "Balance hormones (estrogen, progesterone)",
  "Manage menopause/perimenopause symptoms",
  "Improve energy & reduce fatigue",
  "Better sleep & recovery",
  "Support thyroid health",
  "Improve mood & mental clarity",
  "PCOS/fertility support",
  "Support healthy menstrual cycle",
];

const MALE_SYMPTOMS = [
  "Low energy",
  "Reduced libido",
  "Poor sleep",
  "Brain fog",
  "Low motivation",
  "Joint pain",
  "Erectile dysfunction",
];

const FEMALE_SYMPTOMS = [
  "Low energy",
  "Reduced libido",
  "Poor sleep",
  "Brain fog",
  "Low motivation",
  "Joint pain",
  "Irregular periods",
  "Hot flashes",
  "Mood swings",
  "PMS symptoms",
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [biologicalSex, setBiologicalSex] = useState<"male" | "female" | "prefer_not_to_say" | null>(null);
  const [age, setAge] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [hasRecentLabWork, setHasRecentLabWork] = useState<boolean | null>(null);
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState<boolean | null>(null);

  const updateProfile = trpc.profile.update.useMutation();

  const goals =
    biologicalSex === "male"
      ? MALE_GOALS
      : biologicalSex === "female"
        ? FEMALE_GOALS
        : [...MALE_GOALS, ...FEMALE_GOALS];

  const symptoms =
    biologicalSex === "male"
      ? MALE_SYMPTOMS
      : biologicalSex === "female"
        ? FEMALE_SYMPTOMS
        : [...MALE_SYMPTOMS, ...FEMALE_SYMPTOMS];

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!biologicalSex || !age) return;
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setError("Please log in first to complete your profile setup.");
      return;
    }

    setError(null);
    try {
      await updateProfile.mutateAsync({
        biologicalSex,
        age: parseInt(age),
        goals: selectedGoals,
        currentSymptoms: selectedSymptoms,
        hasRecentLabWork: hasRecentLabWork ?? false,
        cycleTrackingEnabled: cycleTrackingEnabled ?? false,
        onboardingCompleted: true,
      });

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err?.message || "Failed to save profile. Please try again.");
    }
  };

  const canComplete = biologicalSex && age && selectedGoals.length > 0 && hasRecentLabWork !== null && (biologicalSex !== "female" || cycleTrackingEnabled !== null);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
            paddingLeft: Math.max(insets.left, 20),
            paddingRight: Math.max(insets.right, 20),
          },
        ]}
      >
        <ThemedText type="title" style={styles.title}>
          Set Up Your Profile
        </ThemedText>

        {/* Biological Sex */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Biological Sex
          </ThemedText>
          <View style={styles.optionsRow}>
            {(["male", "female", "prefer_not_to_say"] as const).map((sex) => (
              <Pressable
                key={sex}
                onPress={() => setBiologicalSex(sex)}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor: biologicalSex === sex ? colors.tint : colors.surface,
                    borderColor: colors.border,
                  },
                  pressed && styles.optionPressed,
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    { color: biologicalSex === sex ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {sex === "male" ? "Male" : sex === "female" ? "Female" : "Prefer not to say"}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Age */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Age
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Enter your age"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Primary Goals */}
        {biologicalSex && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Primary Goals
            </ThemedText>
            <View style={styles.checkboxList}>
              {goals.map((goal) => (
                <Pressable
                  key={goal}
                  onPress={() => toggleGoal(goal)}
                  style={({ pressed }) => [
                    styles.checkbox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    pressed && styles.checkboxPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        borderColor: selectedGoals.includes(goal) ? colors.tint : colors.border,
                        backgroundColor: selectedGoals.includes(goal) ? colors.tint : "transparent",
                      },
                    ]}
                  >
                    {selectedGoals.includes(goal) && (
                      <ThemedText style={{ color: "#FFFFFF", fontSize: 16 }}>✓</ThemedText>
                    )}
                  </View>
                  <ThemedText style={styles.checkboxLabel}>{goal}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Current Symptoms */}
        {biologicalSex && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Current Symptoms
            </ThemedText>
            <View style={styles.checkboxList}>
              {symptoms.map((symptom) => (
                <Pressable
                  key={symptom}
                  onPress={() => toggleSymptom(symptom)}
                  style={({ pressed }) => [
                    styles.checkbox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    pressed && styles.checkboxPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        borderColor: selectedSymptoms.includes(symptom) ? colors.tint : colors.border,
                        backgroundColor: selectedSymptoms.includes(symptom) ? colors.tint : "transparent",
                      },
                    ]}
                  >
                    {selectedSymptoms.includes(symptom) && (
                      <ThemedText style={{ color: "#FFFFFF", fontSize: 16 }}>✓</ThemedText>
                    )}
                  </View>
                  <ThemedText style={styles.checkboxLabel}>{symptom}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Lab Work Question */}
        {biologicalSex && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Do you have recent lab work?
            </ThemedText>
            <View style={styles.optionsRow}>
              <Pressable
                onPress={() => setHasRecentLabWork(true)}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor: hasRecentLabWork === true ? colors.tint : colors.surface,
                    borderColor: colors.border,
                  },
                  pressed && styles.optionPressed,
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    { color: hasRecentLabWork === true ? "#FFFFFF" : colors.text },
                  ]}
                >
                  Yes
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setHasRecentLabWork(false)}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor: hasRecentLabWork === false ? colors.tint : colors.surface,
                    borderColor: colors.border,
                  },
                  pressed && styles.optionPressed,
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    { color: hasRecentLabWork === false ? "#FFFFFF" : colors.text },
                  ]}
                >
                  No
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Cycle Tracking Question (Female only) */}
        {biologicalSex === "female" && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Would you like to track your menstrual cycle?
            </ThemedText>
            <View style={styles.optionsRow}>
              <Pressable
                onPress={() => setCycleTrackingEnabled(true)}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor: cycleTrackingEnabled === true ? colors.tint : colors.surface,
                    borderColor: colors.border,
                  },
                  pressed && styles.optionPressed,
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    { color: cycleTrackingEnabled === true ? "#FFFFFF" : colors.text },
                  ]}
                >
                  Yes
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setCycleTrackingEnabled(false)}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor: cycleTrackingEnabled === false ? colors.tint : colors.surface,
                    borderColor: colors.border,
                  },
                  pressed && styles.optionPressed,
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    { color: cycleTrackingEnabled === false ? "#FFFFFF" : colors.text },
                  ]}
                >
                  No
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + "20" }]}>
            <ThemedText style={{ color: colors.error, textAlign: "center" }}>
              {error}
            </ThemedText>
          </View>
        )}

        {/* Login Required Notice */}
        {!isAuthenticated && !authLoading && (
          <View style={[styles.loginNotice, { backgroundColor: colors.warning + "20" }]}>
            <ThemedText style={{ color: colors.warning, textAlign: "center", marginBottom: 12 }}>
              Please log in to save your profile
            </ThemedText>
            <Pressable
              onPress={() => router.push("/(tabs)" as any)}
              style={[styles.loginButton, { backgroundColor: colors.tint }]}
            >
              <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>Go to Login</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Complete Button */}
        <Pressable
          onPress={handleComplete}
          disabled={!canComplete || updateProfile.isPending || !isAuthenticated}
          style={({ pressed }) => [
            styles.completeButton,
            {
              backgroundColor: canComplete && isAuthenticated ? colors.tint : colors.surface,
              borderColor: colors.border,
            },
            pressed && canComplete && isAuthenticated && styles.buttonPressed,
            (!canComplete || updateProfile.isPending || !isAuthenticated) && styles.buttonDisabled,
          ]}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.completeButtonText,
                { color: canComplete && isAuthenticated ? "#FFFFFF" : colors.textSecondary },
              ]}
            >
              Complete Setup
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  optionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  checkboxList: {
    gap: 12,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkboxPressed: {
    opacity: 0.8,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  completeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
    marginTop: 16,
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginNotice: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
