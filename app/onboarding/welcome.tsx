import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
          paddingLeft: Math.max(insets.left, 20),
          paddingRight: Math.max(insets.right, 20),
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome to HFL Vitality Tracker
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your hormones, symptoms, and supplements to optimize your health naturally
          </ThemedText>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ fontSize: 32 }}>📊</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Track Biomarkers
            </ThemedText>
            <ThemedText style={[styles.featureText, { color: colors.textSecondary }]}>
              Monitor testosterone, estrogen, and other key hormones over time
            </ThemedText>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ fontSize: 32 }}>💪</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Daily Symptom Log
            </ThemedText>
            <ThemedText style={[styles.featureText, { color: colors.textSecondary }]}>
              Track energy, mood, sleep, and performance with streak tracking
            </ThemedText>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ fontSize: 32 }}>💊</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Supplement Protocols
            </ThemedText>
            <ThemedText style={[styles.featureText, { color: colors.textSecondary }]}>
              Track adherence and see how supplements impact your health
            </ThemedText>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
              <ThemedText style={{ fontSize: 32 }}>🧠</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              AI-Powered Insights
            </ThemedText>
            <ThemedText style={[styles.featureText, { color: colors.textSecondary }]}>
              Discover patterns and correlations in your health data
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push("/onboarding/profile-setup")}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.tint },
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Get Started
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 48,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  features: {
    gap: 32,
  },
  feature: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    paddingTop: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
