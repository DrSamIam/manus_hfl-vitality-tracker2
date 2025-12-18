import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

const NOTIFICATION_SETTINGS_KEY = "notification_settings";

interface NotificationSettings {
  symptomReminder: boolean;
  symptomReminderTime: string; // HH:MM format
  supplementReminder: boolean;
  supplementMorningTime: string;
  supplementEveningTime: string;
  labReminder: boolean;
  labReminderDays: number; // Days before reminder
}

const DEFAULT_SETTINGS: NotificationSettings = {
  symptomReminder: true,
  symptomReminderTime: "21:00",
  supplementReminder: true,
  supplementMorningTime: "08:00",
  supplementEveningTime: "20:00",
  labReminder: true,
  labReminderDays: 7,
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<string>("undetermined");
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
      setSettings(updated);
      await scheduleNotifications(updated);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    return status;
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    
    if (status === "granted") {
      await scheduleNotifications(settings);
    }
    
    return status;
  };

  const scheduleNotifications = async (currentSettings: NotificationSettings) => {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (permissionStatus !== "granted") return;

    // Schedule symptom reminder
    if (currentSettings.symptomReminder) {
      const [hours, minutes] = currentSettings.symptomReminderTime.split(":").map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Log Your Symptoms",
          body: "Track how you're feeling today to build your health insights.",
          data: { type: "symptom_reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    }

    // Schedule morning supplement reminder
    if (currentSettings.supplementReminder) {
      const [amHours, amMinutes] = currentSettings.supplementMorningTime.split(":").map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Morning Supplements",
          body: "Don't forget to take your morning supplements!",
          data: { type: "supplement_morning" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: amHours,
          minute: amMinutes,
        },
      });

      // Schedule evening supplement reminder
      const [pmHours, pmMinutes] = currentSettings.supplementEveningTime.split(":").map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evening Supplements",
          body: "Time for your evening supplements!",
          data: { type: "supplement_evening" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: pmHours,
          minute: pmMinutes,
        },
      });
    }
  };

  const scheduleLabReminder = useCallback(async (labDate: Date, biomarkerName: string) => {
    if (!settings.labReminder || permissionStatus !== "granted") return;

    const reminderDate = new Date(labDate);
    reminderDate.setDate(reminderDate.getDate() - settings.labReminderDays);

    // Only schedule if the reminder date is in the future
    if (reminderDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Lab Test Reminder",
          body: `Your ${biomarkerName} test is coming up in ${settings.labReminderDays} days.`,
          data: { type: "lab_reminder", biomarker: biomarkerName },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });
    }
  }, [settings, permissionStatus]);

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
  };

  return {
    settings,
    loading,
    permissionStatus,
    saveSettings,
    requestPermissions,
    scheduleLabReminder,
    cancelAllNotifications,
    getScheduledNotifications,
  };
}

// Utility function to format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Utility function to parse time from display format
export function parseTime(displayTime: string): string {
  const match = displayTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "12:00";
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}
