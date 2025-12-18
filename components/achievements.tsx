import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
}

// Define all possible achievements
export const ACHIEVEMENTS: Omit<Achievement, "unlocked" | "unlockedDate" | "progress">[] = [
  // Streak achievements
  { id: "streak_3", title: "Getting Started", description: "Log symptoms for 3 days in a row", emoji: "🌱", target: 3 },
  { id: "streak_7", title: "Week Warrior", description: "Log symptoms for 7 days in a row", emoji: "🔥", target: 7 },
  { id: "streak_14", title: "Two Week Champion", description: "Log symptoms for 14 days in a row", emoji: "⚡", target: 14 },
  { id: "streak_30", title: "Monthly Master", description: "Log symptoms for 30 days in a row", emoji: "🏆", target: 30 },
  { id: "streak_100", title: "Century Club", description: "Log symptoms for 100 days in a row", emoji: "💯", target: 100 },
  
  // Biomarker achievements
  { id: "first_biomarker", title: "Lab Rat", description: "Add your first biomarker result", emoji: "🔬", target: 1 },
  { id: "biomarkers_5", title: "Data Driven", description: "Track 5 different biomarkers", emoji: "📊", target: 5 },
  { id: "biomarkers_10", title: "Health Detective", description: "Track 10 different biomarkers", emoji: "🕵️", target: 10 },
  
  // Supplement achievements
  { id: "first_supplement", title: "Supplement Starter", description: "Add your first supplement", emoji: "💊", target: 1 },
  { id: "supplement_adherence_7", title: "Consistent Care", description: "100% supplement adherence for 7 days", emoji: "✅", target: 7 },
  { id: "supplement_adherence_30", title: "Protocol Pro", description: "100% supplement adherence for 30 days", emoji: "🌟", target: 30 },
  
  // Cycle tracking achievements (female)
  { id: "first_cycle", title: "Cycle Tracker", description: "Log your first period", emoji: "🌸", target: 1 },
  { id: "cycles_3", title: "Pattern Finder", description: "Track 3 complete cycles", emoji: "📈", target: 3 },
  { id: "cycles_6", title: "Cycle Expert", description: "Track 6 complete cycles", emoji: "🎯", target: 6 },
  
  // Engagement achievements
  { id: "profile_complete", title: "All Set Up", description: "Complete your profile setup", emoji: "👤", target: 1 },
  { id: "first_insight", title: "Insight Seeker", description: "View your first health insight", emoji: "💡", target: 1 },
  { id: "export_data", title: "Data Owner", description: "Export your health data", emoji: "📤", target: 1 },
];

/**
 * Calculate user's achievements based on their data
 */
export function calculateAchievements(data: {
  streak: number;
  biomarkersCount: number;
  uniqueBiomarkers: number;
  supplementsCount: number;
  perfectAdherenceDays: number;
  cyclesTracked: number;
  profileComplete: boolean;
  hasViewedInsights: boolean;
  hasExportedData: boolean;
}): Achievement[] {
  return ACHIEVEMENTS.map((achievement) => {
    let unlocked = false;
    let progress = 0;

    switch (achievement.id) {
      case "streak_3":
        progress = Math.min(data.streak, 3);
        unlocked = data.streak >= 3;
        break;
      case "streak_7":
        progress = Math.min(data.streak, 7);
        unlocked = data.streak >= 7;
        break;
      case "streak_14":
        progress = Math.min(data.streak, 14);
        unlocked = data.streak >= 14;
        break;
      case "streak_30":
        progress = Math.min(data.streak, 30);
        unlocked = data.streak >= 30;
        break;
      case "streak_100":
        progress = Math.min(data.streak, 100);
        unlocked = data.streak >= 100;
        break;
      case "first_biomarker":
        progress = Math.min(data.biomarkersCount, 1);
        unlocked = data.biomarkersCount >= 1;
        break;
      case "biomarkers_5":
        progress = Math.min(data.uniqueBiomarkers, 5);
        unlocked = data.uniqueBiomarkers >= 5;
        break;
      case "biomarkers_10":
        progress = Math.min(data.uniqueBiomarkers, 10);
        unlocked = data.uniqueBiomarkers >= 10;
        break;
      case "first_supplement":
        progress = Math.min(data.supplementsCount, 1);
        unlocked = data.supplementsCount >= 1;
        break;
      case "supplement_adherence_7":
        progress = Math.min(data.perfectAdherenceDays, 7);
        unlocked = data.perfectAdherenceDays >= 7;
        break;
      case "supplement_adherence_30":
        progress = Math.min(data.perfectAdherenceDays, 30);
        unlocked = data.perfectAdherenceDays >= 30;
        break;
      case "first_cycle":
        progress = Math.min(data.cyclesTracked, 1);
        unlocked = data.cyclesTracked >= 1;
        break;
      case "cycles_3":
        progress = Math.min(data.cyclesTracked, 3);
        unlocked = data.cyclesTracked >= 3;
        break;
      case "cycles_6":
        progress = Math.min(data.cyclesTracked, 6);
        unlocked = data.cyclesTracked >= 6;
        break;
      case "profile_complete":
        progress = data.profileComplete ? 1 : 0;
        unlocked = data.profileComplete;
        break;
      case "first_insight":
        progress = data.hasViewedInsights ? 1 : 0;
        unlocked = data.hasViewedInsights;
        break;
      case "export_data":
        progress = data.hasExportedData ? 1 : 0;
        unlocked = data.hasExportedData;
        break;
    }

    return {
      ...achievement,
      unlocked,
      progress,
    };
  });
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "small" | "large";
}

export function AchievementBadge({ achievement, size = "small" }: AchievementBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isSmall = size === "small";
  const badgeSize = isSmall ? 60 : 80;
  const emojiSize = isSmall ? 28 : 40;

  return (
    <View style={[styles.badge, { width: badgeSize }]}>
      <View
        style={[
          styles.badgeCircle,
          {
            width: badgeSize,
            height: badgeSize,
            backgroundColor: achievement.unlocked ? colors.tint + "20" : colors.surface,
            borderColor: achievement.unlocked ? colors.tint : colors.border,
            opacity: achievement.unlocked ? 1 : 0.5,
          },
        ]}
      >
        <ThemedText style={{ fontSize: emojiSize, opacity: achievement.unlocked ? 1 : 0.3 }}>
          {achievement.emoji}
        </ThemedText>
      </View>
      <ThemedText
        style={[
          styles.badgeTitle,
          {
            color: achievement.unlocked ? colors.text : colors.textSecondary,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
        numberOfLines={2}
      >
        {achievement.title}
      </ThemedText>
      {!achievement.unlocked && achievement.target && achievement.progress !== undefined && (
        <ThemedText style={{ fontSize: 9, color: colors.textSecondary }}>
          {achievement.progress}/{achievement.target}
        </ThemedText>
      )}
    </View>
  );
}

interface AchievementsGridProps {
  achievements: Achievement[];
  showLocked?: boolean;
}

export function AchievementsGrid({ achievements, showLocked = true }: AchievementsGridProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const displayAchievements = showLocked
    ? achievements
    : achievements.filter((a) => a.unlocked);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Achievements</ThemedText>
        <ThemedText style={{ color: colors.textSecondary }}>
          {unlockedCount}/{achievements.length}
        </ThemedText>
      </View>

      <View style={styles.grid}>
        {displayAchievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "flex-start",
  },
  badge: {
    alignItems: "center",
  },
  badgeCircle: {
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  badgeTitle: {
    textAlign: "center",
    lineHeight: 14,
  },
});
