import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const LOCAL_PROFILE_KEY = "@hfl_local_profile";

export type LocalProfile = {
  biologicalSex: "male" | "female" | "prefer_not_to_say" | null;
  age: number | null;
  goals: string[];
  currentSymptoms: string[];
  hasRecentLabWork: boolean;
  cycleTrackingEnabled: boolean;
  onboardingCompleted: boolean;
  fitnessGoal?: string;
  fitnessExperience?: string;
  availableEquipment?: string[];
  workoutFrequency?: string;
  preferredWorkoutDuration?: string;
  fitnessOnboardingCompleted?: boolean;
};

const DEFAULT_PROFILE: LocalProfile = {
  biologicalSex: null,
  age: null,
  goals: [],
  currentSymptoms: [],
  hasRecentLabWork: false,
  cycleTrackingEnabled: false,
  onboardingCompleted: false,
};

export function useLocalProfile() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from AsyncStorage
  const loadProfile = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        setProfile(DEFAULT_PROFILE);
      }
    } catch (error) {
      console.error("[LocalProfile] Failed to load:", error);
      setProfile(DEFAULT_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save profile to AsyncStorage
  const saveProfile = useCallback(async (updates: Partial<LocalProfile>) => {
    try {
      const newProfile = { ...(profile || DEFAULT_PROFILE), ...updates };
      await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
      return { success: true };
    } catch (error) {
      console.error("[LocalProfile] Failed to save:", error);
      return { success: false, error };
    }
  }, [profile]);

  // Clear profile (for logout/reset)
  const clearProfile = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);
      setProfile(DEFAULT_PROFILE);
    } catch (error) {
      console.error("[LocalProfile] Failed to clear:", error);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    saveProfile,
    clearProfile,
    refresh: loadProfile,
  };
}
