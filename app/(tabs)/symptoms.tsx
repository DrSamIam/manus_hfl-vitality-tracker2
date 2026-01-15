import { useState } from "react";

import { SymptomCalendar } from "@/components/symptom-calendar";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

const PERIOD_SYMPTOMS = [
  "Cramping",
  "Bloating",
  "Headache/Migraine",
  "Breast tenderness",
  "Back pain",
  "Mood swings/irritability",
  "Fatigue",
  "Food cravings",
];

export default function SymptomsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { isAuthenticated } = useAuth();

  const today = new Date().toISOString().split("T")[0];

  const [energy, setEnergy] = useState(5);
  const [mood, setMood] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [mentalClarity, setMentalClarity] = useState(5);
  const [libido, setLibido] = useState(5);
  const [performanceStamina, setPerformanceStamina] = useState(5);
  const [notes, setNotes] = useState("");
  const [flowLevel, setFlowLevel] = useState<string | null>(null);
  const [selectedPeriodSymptoms, setSelectedPeriodSymptoms] = useState<string[]>([]);
  const [crampingSeverity, setCrampingSeverity] = useState(5);

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: todaysSymptom, refetch } = trpc.symptoms.byDate.useQuery(
    { logDate: today },
    { enabled: isAuthenticated }
  );
  const { data: streak } = trpc.symptoms.streak.useQuery(undefined, { enabled: isAuthenticated });
  const { data: cycleDay } = trpc.cycles.currentDay.useQuery(undefined, {
    enabled: isAuthenticated && !!profile?.cycleTrackingEnabled,
  });
  const { data: allSymptoms } = trpc.symptoms.list.useQuery(
    { limit: 90 },
    { enabled: isAuthenticated }
  );
  const { data: cycles } = trpc.cycles.list.useQuery(undefined, {
    enabled: isAuthenticated && !!profile?.cycleTrackingEnabled,
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const createSymptom = trpc.symptoms.create.useMutation({
    onSuccess: () => refetch(),
  });

  const isFemale = profile?.biologicalSex === "female";
  const showCycleTracking = isFemale && profile?.cycleTrackingEnabled;
  const isInPeriod = showCycleTracking && cycleDay && cycleDay <= 7;

  const handleSave = async () => {
    await createSymptom.mutateAsync({
      logDate: today,
      energy,
      mood,
      sleep,
      mentalClarity,
      libido,
      performanceStamina,
      notes: notes || undefined,
      cycleDay: cycleDay ?? undefined,
    });
  };

  const togglePeriodSymptom = (symptom: string) => {
    setSelectedPeriodSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const getEmojiForValue = (value: number, type: string) => {
    if (type === "energy") return value <= 3 ? "😴" : value <= 6 ? "😐" : "⚡";
    if (type === "mood") return value <= 3 ? "😞" : value <= 6 ? "😐" : "😊";
    if (type === "sleep") return value <= 3 ? "😫" : value <= 6 ? "😐" : "😴";
    if (type === "clarity") return value <= 3 ? "🌫️" : value <= 6 ? "😐" : "🧠";
    if (type === "libido") return value <= 3 ? "❄️" : value <= 6 ? "😐" : "🔥";
    if (type === "performance") return value <= 3 ? "😓" : value <= 6 ? "😐" : "💪";
    return "😐";
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Please log in to track symptoms</ThemedText>
      </ThemedView>
    );
  }

  if (todaysSymptom) {
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
            <ThemedText type="title">Symptoms</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Daily Symptom Journal
            </ThemedText>
          </View>

          {/* Calendar Toggle */}
          <Pressable
            onPress={() => setShowCalendar(!showCalendar)}
            style={[styles.calendarToggle, { backgroundColor: colors.surface }]}
          >
            <ThemedText style={{ fontSize: 20 }}>📅</ThemedText>
            <ThemedText type="defaultSemiBold">
              {showCalendar ? "Hide Calendar" : "View Calendar"}
            </ThemedText>
          </Pressable>

          {/* Calendar View */}
          {showCalendar && allSymptoms && (
            <SymptomCalendar
              symptoms={allSymptoms.map((s) => ({
                id: s.id,
                logDate: s.logDate as unknown as string,
                energy: s.energy,
                mood: s.mood,
                sleep: s.sleep,
                mentalClarity: s.mentalClarity,
                libido: s.libido,
                performanceStamina: s.performanceStamina,
                notes: s.notes,
              }))}
              cycles={cycles?.map((c) => ({
                startDate: c.cycleStartDate as unknown as string,
                endDate: c.cycleEndDate as unknown as string | undefined,
              }))}
              cycleTrackingEnabled={showCycleTracking ?? false}
            />
          )}

          <View style={[styles.completedCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 48, marginBottom: 16 }}>✅</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              Today's Log Complete!
            </ThemedText>
            <View style={styles.streakBadge}>
              <ThemedText style={{ fontSize: 24 }}>🔥</ThemedText>
              <ThemedText type="title" style={{ color: colors.accentSecondary }}>
                {streak ?? 0}
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary }}>day streak</ThemedText>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 16 }}>
              Today's Summary
            </ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText>Energy</ThemedText>
              <ThemedText type="defaultSemiBold">{todaysSymptom.energy}/10</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Mood</ThemedText>
              <ThemedText type="defaultSemiBold">{todaysSymptom.mood}/10</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Sleep Quality</ThemedText>
              <ThemedText type="defaultSemiBold">{todaysSymptom.sleep}/10</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Mental Clarity</ThemedText>
              <ThemedText type="defaultSemiBold">{todaysSymptom.mentalClarity}/10</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Libido</ThemedText>
              <ThemedText type="defaultSemiBold">{todaysSymptom.libido}/10</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>{isFemale ? "Physical Energy" : "Workout Performance"}</ThemedText>
              <ThemedText type="defaultSemiBold">{todaysSymptom.performanceStamina}/10</ThemedText>
            </View>
            {todaysSymptom.notes && (
              <View style={[styles.notesSection, { borderTopColor: colors.border }]}>
                <ThemedText style={{ color: colors.textSecondary, fontStyle: "italic" }}>
                  "{todaysSymptom.notes}"
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
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
          <ThemedText type="title">Symptoms</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Daily Symptom Journal
          </ThemedText>
          {showCycleTracking && cycleDay && (
            <View style={[styles.cycleBadge, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ color: colors.tint }}>Cycle Day {cycleDay}</ThemedText>
            </View>
          )}
        </View>

        {/* Universal Symptoms */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            How are you feeling today?
          </ThemedText>

          {/* Energy */}
          <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.sliderHeader}>
              <ThemedText type="defaultSemiBold">Energy Level</ThemedText>
              <ThemedText style={{ fontSize: 24 }}>{getEmojiForValue(energy, "energy")}</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={energy}
              onValueChange={(val) => setEnergy(Math.round(val))}
              onSlidingComplete={(val) => setEnergy(Math.round(val))}
              minimumTrackTintColor={colors.tint}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.tint}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>😴 Low</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{energy}</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>High ⚡</ThemedText>
            </View>
          </View>

          {/* Mood */}
          <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.sliderHeader}>
              <ThemedText type="defaultSemiBold">Mood</ThemedText>
              <ThemedText style={{ fontSize: 24 }}>{getEmojiForValue(mood, "mood")}</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={mood}
              onValueChange={(val) => setMood(Math.round(val))}
              onSlidingComplete={(val) => setMood(Math.round(val))}
              minimumTrackTintColor={colors.tint}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.tint}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>😞 Low</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{mood}</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>High 😊</ThemedText>
            </View>
          </View>

          {/* Sleep Quality */}
          <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.sliderHeader}>
              <ThemedText type="defaultSemiBold">Sleep Quality</ThemedText>
              <ThemedText style={{ fontSize: 24 }}>{getEmojiForValue(sleep, "sleep")}</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={sleep}
              onValueChange={(val) => setSleep(Math.round(val))}
              onSlidingComplete={(val) => setSleep(Math.round(val))}
              minimumTrackTintColor={colors.tint}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.tint}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Poor</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{sleep}</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Excellent</ThemedText>
            </View>
          </View>

          {/* Mental Clarity */}
          <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.sliderHeader}>
              <ThemedText type="defaultSemiBold">Mental Clarity</ThemedText>
              <ThemedText style={{ fontSize: 24 }}>{getEmojiForValue(mentalClarity, "clarity")}</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={mentalClarity}
              onValueChange={(val) => setMentalClarity(Math.round(val))}
              onSlidingComplete={(val) => setMentalClarity(Math.round(val))}
              minimumTrackTintColor={colors.tint}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.tint}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>🌫️ Foggy</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{mentalClarity}</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Sharp 🧠</ThemedText>
            </View>
          </View>

          {/* Libido */}
          <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.sliderHeader}>
              <ThemedText type="defaultSemiBold">{isFemale ? "Libido/Sexual Interest" : "Libido/Sexual Desire"}</ThemedText>
              <ThemedText style={{ fontSize: 24 }}>{getEmojiForValue(libido, "libido")}</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={libido}
              onValueChange={(val) => setLibido(Math.round(val))}
              onSlidingComplete={(val) => setLibido(Math.round(val))}
              minimumTrackTintColor={colors.tint}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.tint}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Low</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{libido}</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>High</ThemedText>
            </View>
          </View>

          {/* Performance/Stamina */}
          <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.sliderHeader}>
              <ThemedText type="defaultSemiBold">{isFemale ? "Physical Energy/Stamina" : "Workout Performance/Strength"}</ThemedText>
              <ThemedText style={{ fontSize: 24 }}>{getEmojiForValue(performanceStamina, "performance")}</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={performanceStamina}
              onValueChange={(val) => setPerformanceStamina(Math.round(val))}
              onSlidingComplete={(val) => setPerformanceStamina(Math.round(val))}
              minimumTrackTintColor={colors.tint}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.tint}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Weak</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{performanceStamina}</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>Strong</ThemedText>
            </View>
          </View>
        </View>

        {/* Period Symptoms (Female only during menstruation) */}
        {isInPeriod && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Period Symptoms
            </ThemedText>

            {/* Flow Level */}
            <View style={[styles.flowCard, { backgroundColor: colors.surface }]}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>
                Menstrual Flow
              </ThemedText>
              <View style={styles.flowOptions}>
                {["none", "spotting", "light", "moderate", "heavy"].map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => setFlowLevel(level)}
                    style={[
                      styles.flowOption,
                      {
                        backgroundColor: flowLevel === level ? colors.menstruation : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: flowLevel === level ? "#FFFFFF" : colors.text,
                        fontSize: 12,
                        textTransform: "capitalize",
                      }}
                    >
                      {level}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Period Symptoms Checkboxes */}
            <View style={[styles.periodSymptomsCard, { backgroundColor: colors.surface }]}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>
                Symptoms
              </ThemedText>
              <View style={styles.periodSymptomsList}>
                {PERIOD_SYMPTOMS.map((symptom) => (
                  <Pressable
                    key={symptom}
                    onPress={() => togglePeriodSymptom(symptom)}
                    style={[
                      styles.periodSymptomOption,
                      {
                        backgroundColor: selectedPeriodSymptoms.includes(symptom) ? colors.tint : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: selectedPeriodSymptoms.includes(symptom) ? "#FFFFFF" : colors.text,
                        fontSize: 13,
                      }}
                    >
                      {symptom}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Notes (Optional)
          </ThemedText>
          <TextInput
            style={[
              styles.notesInput,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Add any additional notes about how you're feeling..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={createSymptom.isPending}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: colors.tint },
            pressed && styles.buttonPressed,
          ]}
        >
          {createSymptom.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>
              Save Daily Log
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
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
  cycleBadge: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, alignSelf: "flex-start" },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 16 },
  sliderCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  slider: { width: "100%", height: 40 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  flowCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  flowOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  flowOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  periodSymptomsCard: { padding: 16, borderRadius: 12 },
  periodSymptomsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  periodSymptomOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  notesInput: { padding: 16, borderRadius: 12, borderWidth: 1, minHeight: 100, textAlignVertical: "top", fontSize: 16 },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 8 },
  buttonPressed: { opacity: 0.8 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16 },
  completedCard: { padding: 40, borderRadius: 16, alignItems: "center", marginBottom: 24 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  summaryCard: { padding: 20, borderRadius: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  notesSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  calendarToggle: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16, borderRadius: 12, marginBottom: 16 },
});
