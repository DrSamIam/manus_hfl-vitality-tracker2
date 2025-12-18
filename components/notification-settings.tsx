import { useState } from "react";
import { Pressable, StyleSheet, Switch, TextInput, View, Alert } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNotifications, formatTime } from "@/hooks/use-notifications";

export function NotificationSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const {
    settings,
    loading,
    permissionStatus,
    saveSettings,
    requestPermissions,
  } = useNotifications();

  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");

  const handlePermissionRequest = async () => {
    const status = await requestPermissions();
    if (status !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in your device settings to receive reminders.",
        [{ text: "OK" }]
      );
    }
  };

  const handleTimeEdit = (field: string, currentValue: string) => {
    setEditingTime(field);
    setTempTime(currentValue);
  };

  const handleTimeSave = (field: string) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(tempTime)) {
      saveSettings({ [field]: tempTime });
    }
    setEditingTime(null);
    setTempTime("");
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ThemedText>Loading settings...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ThemedText type="subtitle" style={styles.title}>
        Notification Settings
      </ThemedText>

      {/* Permission status */}
      {permissionStatus !== "granted" && (
        <Pressable
          onPress={handlePermissionRequest}
          style={[styles.permissionBanner, { backgroundColor: colors.warning + "20" }]}
        >
          <ThemedText style={{ color: colors.warning }}>
            Notifications are disabled. Tap to enable.
          </ThemedText>
        </Pressable>
      )}

      {/* Symptom Reminder */}
      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={styles.settingInfo}>
          <ThemedText type="defaultSemiBold">Daily Symptom Reminder</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
            Get reminded to log your symptoms
          </ThemedText>
        </View>
        <Switch
          value={settings.symptomReminder}
          onValueChange={(value) => saveSettings({ symptomReminder: value })}
          trackColor={{ false: colors.border, true: colors.tint + "80" }}
          thumbColor={settings.symptomReminder ? colors.tint : "#f4f3f4"}
        />
      </View>

      {settings.symptomReminder && (
        <View style={[styles.timeRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={{ color: colors.textSecondary }}>Reminder Time</ThemedText>
          {editingTime === "symptomReminderTime" ? (
            <View style={styles.timeEdit}>
              <TextInput
                style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text }]}
                value={tempTime}
                onChangeText={setTempTime}
                placeholder="HH:MM"
                keyboardType="numbers-and-punctuation"
                autoFocus
              />
              <Pressable onPress={() => handleTimeSave("symptomReminderTime")}>
                <ThemedText style={{ color: colors.tint }}>Save</ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => handleTimeEdit("symptomReminderTime", settings.symptomReminderTime)}>
              <ThemedText style={{ color: colors.tint }}>{formatTime(settings.symptomReminderTime)}</ThemedText>
            </Pressable>
          )}
        </View>
      )}

      {/* Supplement Reminder */}
      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={styles.settingInfo}>
          <ThemedText type="defaultSemiBold">Supplement Reminders</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
            Morning and evening supplement alerts
          </ThemedText>
        </View>
        <Switch
          value={settings.supplementReminder}
          onValueChange={(value) => saveSettings({ supplementReminder: value })}
          trackColor={{ false: colors.border, true: colors.tint + "80" }}
          thumbColor={settings.supplementReminder ? colors.tint : "#f4f3f4"}
        />
      </View>

      {settings.supplementReminder && (
        <>
          <View style={[styles.timeRow, { borderBottomColor: colors.border }]}>
            <ThemedText style={{ color: colors.textSecondary }}>Morning Time</ThemedText>
            {editingTime === "supplementMorningTime" ? (
              <View style={styles.timeEdit}>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={tempTime}
                  onChangeText={setTempTime}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                  autoFocus
                />
                <Pressable onPress={() => handleTimeSave("supplementMorningTime")}>
                  <ThemedText style={{ color: colors.tint }}>Save</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => handleTimeEdit("supplementMorningTime", settings.supplementMorningTime)}>
                <ThemedText style={{ color: colors.tint }}>{formatTime(settings.supplementMorningTime)}</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={[styles.timeRow, { borderBottomColor: colors.border }]}>
            <ThemedText style={{ color: colors.textSecondary }}>Evening Time</ThemedText>
            {editingTime === "supplementEveningTime" ? (
              <View style={styles.timeEdit}>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={tempTime}
                  onChangeText={setTempTime}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                  autoFocus
                />
                <Pressable onPress={() => handleTimeSave("supplementEveningTime")}>
                  <ThemedText style={{ color: colors.tint }}>Save</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => handleTimeEdit("supplementEveningTime", settings.supplementEveningTime)}>
                <ThemedText style={{ color: colors.tint }}>{formatTime(settings.supplementEveningTime)}</ThemedText>
              </Pressable>
            )}
          </View>
        </>
      )}

      {/* Lab Reminder */}
      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={styles.settingInfo}>
          <ThemedText type="defaultSemiBold">Lab Test Reminders</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
            Get reminded before scheduled lab tests
          </ThemedText>
        </View>
        <Switch
          value={settings.labReminder}
          onValueChange={(value) => saveSettings({ labReminder: value })}
          trackColor={{ false: colors.border, true: colors.tint + "80" }}
          thumbColor={settings.labReminder ? colors.tint : "#f4f3f4"}
        />
      </View>

      {settings.labReminder && (
        <View style={[styles.timeRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={{ color: colors.textSecondary }}>Days Before</ThemedText>
          <View style={styles.daysSelector}>
            {[3, 7, 14].map((days) => (
              <Pressable
                key={days}
                onPress={() => saveSettings({ labReminderDays: days })}
                style={[
                  styles.dayOption,
                  {
                    backgroundColor: settings.labReminderDays === days ? colors.tint : colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color: settings.labReminderDays === days ? "#FFFFFF" : colors.text,
                    fontSize: 13,
                  }}
                >
                  {days}d
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <ThemedText style={[styles.note, { color: colors.textSecondary }]}>
        Notifications help you maintain consistency with your health tracking routine.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  permissionBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 16,
    borderBottomWidth: 1,
  },
  timeEdit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeInput: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    width: 80,
    textAlign: "center",
  },
  daysSelector: {
    flexDirection: "row",
    gap: 8,
  },
  dayOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
  },
});
