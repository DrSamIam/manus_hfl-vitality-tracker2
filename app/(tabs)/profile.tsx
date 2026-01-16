import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HealthReportGenerator } from "@/components/health-report";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();

  const { data: profile, refetch: refetchProfile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: notificationSettings, refetch: refetchNotifications } = trpc.notificationSettings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: streak } = trpc.symptoms.streak.useQuery(undefined, { enabled: isAuthenticated });
  const { data: biomarkers } = trpc.biomarkers.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: symptoms } = trpc.symptoms.list.useQuery({ limit: 100 }, { enabled: isAuthenticated });
  const { data: supplements } = trpc.supplements.list.useQuery({}, { enabled: isAuthenticated });
  const { data: medications } = trpc.medications.list.useQuery({ activeOnly: false }, { enabled: isAuthenticated });
  const { data: workouts } = trpc.workouts.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: foodLogs } = trpc.food.list.useQuery({}, { enabled: isAuthenticated });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => refetchProfile(),
  });
  const createNotificationSettings = trpc.notificationSettings.create.useMutation({
    onSuccess: () => refetchNotifications(),
  });
  const updateNotificationSettings = trpc.notificationSettings.update.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  };

  const handleToggleCycleTracking = async () => {
    if (!profile) return;
    await updateProfile.mutateAsync({
      cycleTrackingEnabled: !profile.cycleTrackingEnabled,
    });
  };

  const handleToggleNotification = async (key: string, value: boolean) => {
    if (!notificationSettings) {
      await createNotificationSettings.mutateAsync({ [key]: value });
    } else {
      await updateNotificationSettings.mutateAsync({ [key]: value });
    }
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Your data export will be prepared. This feature will be available soon.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deletion", "Please contact support to delete your account.");
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Please log in to view your profile</ThemedText>
      </ThemedView>
    );
  }

  if (authLoading || !profile) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  const isFemale = profile.biologicalSex === "female";

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
          <ThemedText type="title">Profile</ThemedText>
        </View>

        {/* User Info Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="subtitle" style={styles.userName}>
            {user?.name || "User"}
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary }}>
            {user?.email || "No email"}
          </ThemedText>
          <View style={styles.profileBadges}>
            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                {profile.biologicalSex === "male" ? "♂ Male" : profile.biologicalSex === "female" ? "♀ Female" : "Not specified"}
              </ThemedText>
            </View>
            {profile.age && (
              <View style={[styles.badge, { backgroundColor: colors.background }]}>
                <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {profile.age} years old
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Your Stats
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText type="title" style={{ color: colors.tint }}>
                {streak ?? 0}
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Day Streak 🔥
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={{ color: colors.tint }}>
                {biomarkers?.length ?? 0}
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Lab Results
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={{ color: colors.tint }}>
                {symptoms?.length ?? 0}
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Daily Logs
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>

          {/* Cycle Tracking (Female only) */}
          {isFemale && (
            <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
              <View style={styles.settingInfo}>
                <ThemedText type="defaultSemiBold">Cycle Tracking</ThemedText>
                <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Track your menstrual cycle
                </ThemedText>
              </View>
              <Switch
                value={profile.cycleTrackingEnabled ?? false}
                onValueChange={handleToggleCycleTracking}
                trackColor={{ false: colors.border, true: colors.tint }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}

          {/* Notification Settings */}
          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold">Daily Reminder</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Remind me to log symptoms
              </ThemedText>
            </View>
            <Switch
              value={notificationSettings?.dailySymptomReminder ?? false}
              onValueChange={(value) => handleToggleNotification("dailySymptomReminder", value)}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold">Supplement Reminders</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Remind me to take supplements
              </ThemedText>
            </View>
            <Switch
              value={notificationSettings?.supplementReminders ?? false}
              onValueChange={(value) => handleToggleNotification("supplementReminders", value)}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold">Weekly Insights</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Receive weekly health insights
              </ThemedText>
            </View>
            <Switch
              value={notificationSettings?.weeklyInsightsEmail ?? false}
              onValueChange={(value) => handleToggleNotification("weeklyInsightsEmail", value)}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor="#FFFFFF"
            />
          </View>

          {isFemale && profile.cycleTrackingEnabled && (
            <>
              <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
                <View style={styles.settingInfo}>
                  <ThemedText type="defaultSemiBold">Period Predictions</ThemedText>
                  <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Notify before predicted period
                  </ThemedText>
                </View>
                <Switch
                  value={notificationSettings?.periodPredictionNotifications ?? false}
                  onValueChange={(value) => handleToggleNotification("periodPredictionNotifications", value)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
                <View style={styles.settingInfo}>
                  <ThemedText type="defaultSemiBold">Ovulation Window</ThemedText>
                  <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Notify during fertile window
                  </ThemedText>
                </View>
                <Switch
                  value={notificationSettings?.ovulationWindowNotifications ?? false}
                  onValueChange={(value) => handleToggleNotification("ovulationWindowNotifications", value)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </>
          )}
        </View>

        {/* Health Report Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Health Report
          </ThemedText>
          <HealthReportGenerator
            userName={user?.name || "User"}
            biologicalSex={profile.biologicalSex || ""}
            age={profile.age}
            goals={profile.goals || []}
            symptoms={(symptoms || []).map((s) => ({
              logDate: s.logDate as unknown as string,
              energy: s.energy,
              mood: s.mood,
              sleep: s.sleep,
              mentalClarity: s.mentalClarity,
              libido: s.libido,
              performanceStamina: s.performanceStamina,
            }))}
            biomarkers={(biomarkers || []).map((b) => ({
              markerName: b.markerName,
              value: b.value,
              unit: b.unit,
              testDate: b.testDate as unknown as string,
            }))}
            supplements={(supplements || []).map((s) => ({
              name: s.name,
              dosage: s.dosage,
              timing: s.timing,
              active: s.active,
            }))}
            medications={(medications || []).map((m) => ({
              drugName: m.drugName,
              dosage: m.dosage,
              frequency: m.frequency,
              reason: m.reason,
              active: m.active,
            }))}
            workouts={(workouts || []).map((w) => ({
              workoutDate: w.workoutDate as unknown as string,
              workoutType: w.workoutType,
              name: w.name,
              durationMinutes: w.durationMinutes,
              caloriesBurned: w.caloriesBurned,
              intensity: w.intensity,
            }))}
            foodLogs={(foodLogs || []).map((f) => ({
              logDate: f.logDate as unknown as string,
              mealType: f.mealType,
              totalCalories: f.totalCalories || 0,
              totalProtein: String(f.totalProtein || 0),
              totalCarbs: String(f.totalCarbs || 0),
              totalFat: String(f.totalFat || 0),
              healthScore: f.healthScore,
            }))}
          />
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data & Privacy
          </ThemedText>

          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.surface },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.error }}>
              Delete Account
            </ThemedText>
            <ThemedText style={{ color: colors.error }}>→</ThemedText>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: colors.surface, borderColor: colors.error },
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText type="defaultSemiBold" style={{ color: colors.error }}>
            Log Out
          </ThemedText>
        </Pressable>

        {/* Version */}
        <ThemedText style={[styles.version, { color: colors.textSecondary }]}>
          HFL Vitality Tracker v1.0.0
        </ThemedText>
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
  card: { padding: 20, borderRadius: 16, marginBottom: 16, alignItems: "center" },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 32, fontWeight: "bold" },
  userName: { marginBottom: 4 },
  profileBadges: { flexDirection: "row", gap: 8, marginTop: 12 },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  cardTitle: { alignSelf: "flex-start", marginBottom: 16 },
  statsGrid: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  statItem: { alignItems: "center" },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 8 },
  settingInfo: { flex: 1, marginRight: 16 },
  actionButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 8 },
  buttonPressed: { opacity: 0.8 },
  logoutButton: { padding: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, marginTop: 8 },
  version: { textAlign: "center", fontSize: 12, marginTop: 24 },
});
