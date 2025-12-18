import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const { data: profile, refetch: refetchProfile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: streak } = trpc.symptoms.streak.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: todaysSymptom, refetch: refetchSymptom } = trpc.symptoms.byDate.useQuery(
    { logDate: new Date().toISOString().split("T")[0] },
    { enabled: isAuthenticated }
  );
  const { data: supplements } = trpc.supplements.list.useQuery(
    { activeOnly: true },
    { enabled: isAuthenticated }
  );
  const { data: cycleDay } = trpc.cycles.currentDay.useQuery(undefined, {
    enabled: isAuthenticated && !!profile?.cycleTrackingEnabled,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchSymptom()]);
    setRefreshing(false);
  };

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!authLoading && isAuthenticated && profile && !profile.onboardingCompleted) {
      router.replace("/onboarding/welcome" as any);
    }
  }, [authLoading, isAuthenticated, profile]);

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.centered}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            HFL Vitality Tracker
          </ThemedText>
          <ThemedText style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Track your hormones, symptoms, and supplements to optimize your health
          </ThemedText>
          <Pressable
            onPress={() => router.push("/onboarding/welcome" as any)}
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: colors.tint },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
              Get Started
            </ThemedText>
          </Pressable>
        </View>
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

  const hasLoggedToday = !!todaysSymptom;
  const isFemale = profile.biologicalSex === "female";
  const showCycleTracking = isFemale && profile.cycleTrackingEnabled;

  // Get primary biomarker label based on sex
  const primaryBiomarkerLabel =
    profile.biologicalSex === "male"
      ? "Testosterone"
      : profile.biologicalSex === "female"
        ? "Estradiol"
        : "Primary Biomarker";

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <ThemedText style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </ThemedText>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Latest Hormone */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Latest {primaryBiomarkerLabel}
            </ThemedText>
            <ThemedText type="title" style={[styles.statValue, { color: colors.tint }]}>
              --
            </ThemedText>
            <ThemedText style={[styles.statSubtext, { color: colors.textSecondary }]}>
              No data yet
            </ThemedText>
          </View>

          {/* Streak */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Current Streak
            </ThemedText>
            <View style={styles.streakRow}>
              <ThemedText type="title" style={[styles.statValue, { color: colors.accentSecondary }]}>
                {streak ?? 0}
              </ThemedText>
              <ThemedText style={{ fontSize: 24 }}>🔥</ThemedText>
            </View>
            <ThemedText style={[styles.statSubtext, { color: colors.textSecondary }]}>
              {streak === 1 ? "day" : "days"}
            </ThemedText>
          </View>

          {/* Energy Trend */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Energy Trend
            </ThemedText>
            <ThemedText type="title" style={[styles.statValue, { color: colors.success }]}>
              --
            </ThemedText>
            <ThemedText style={[styles.statSubtext, { color: colors.textSecondary }]}>
              7-day average
            </ThemedText>
          </View>

          {/* Cycle Day or Next Lab */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              {showCycleTracking ? "Cycle Day" : "Next Lab Due"}
            </ThemedText>
            <ThemedText type="title" style={[styles.statValue, { color: colors.accent }]}>
              {showCycleTracking ? (cycleDay ?? "--") : "--"}
            </ThemedText>
            <ThemedText style={[styles.statSubtext, { color: colors.textSecondary }]}>
              {showCycleTracking ? "of cycle" : "Not scheduled"}
            </ThemedText>
          </View>
        </View>

        {/* Today's Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today's Actions
          </ThemedText>

          {!hasLoggedToday ? (
            <Pressable
              onPress={() => router.push("/(tabs)/symptoms" as any)}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: colors.tint,
                  shadowColor: colors.tint,
                },
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                📝 Daily Check-In
              </ThemedText>
              <ThemedText style={styles.actionButtonSubtext}>
                Log your symptoms for today
              </ThemedText>
            </Pressable>
          ) : (
            <View style={[styles.completedCard, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ fontSize: 24 }}>✅</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ marginLeft: 12 }}>
                Daily check-in complete!
              </ThemedText>
            </View>
          )}

          {/* Supplement Checklist */}
          {supplements && supplements.length > 0 && (
            <View style={[styles.supplementsCard, { backgroundColor: colors.surface }]}>
              <ThemedText type="defaultSemiBold" style={styles.supplementsTitle}>
                Today's Supplements
              </ThemedText>
              {supplements.slice(0, 3).map((supplement) => (
                <View key={supplement.id} style={styles.supplementRow}>
                  <ThemedText style={styles.supplementName}>
                    {supplement.name} ({supplement.dosage})
                  </ThemedText>
                  <View style={styles.supplementCheckboxes}>
                    <View style={[styles.miniCheckbox, { borderColor: colors.border }]}>
                      <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>AM</ThemedText>
                    </View>
                    <View style={[styles.miniCheckbox, { borderColor: colors.border }]}>
                      <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>PM</ThemedText>
                    </View>
                  </View>
                </View>
              ))}
              {supplements.length > 3 && (
                <Pressable onPress={() => router.push("/(tabs)/supplements" as any)}>
                  <ThemedText style={[styles.viewAllLink, { color: colors.tint }]}>
                    View all {supplements.length} supplements →
                  </ThemedText>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ThemedText style={{ fontSize: 32, marginBottom: 8 }}>📊</ThemedText>
            <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Start tracking to see your activity here
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    marginTop: 4,
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeSubtitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 34,
  },
  statSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  actionButton: {
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 4,
  },
  actionButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  supplementsCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  supplementsTitle: {
    marginBottom: 12,
  },
  supplementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  supplementName: {
    flex: 1,
    fontSize: 14,
  },
  supplementCheckboxes: {
    flexDirection: "row",
    gap: 8,
  },
  miniCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllLink: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    textAlign: "center",
    fontSize: 14,
  },
});
