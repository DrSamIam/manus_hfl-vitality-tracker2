import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 49 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 9,
        },
      }}
    >
      {/* Dashboard / Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} />,
        }}
      />
      {/* Dr. Sam AI Chat */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Dr. Sam",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="stethoscope" color={color} />,
        }}
      />
      {/* Daily Symptoms */}
      <Tabs.Screen
        name="symptoms"
        options={{
          title: "Symptoms",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="heart.text.square.fill" color={color} />,
        }}
      />
      {/* Diet / Nutrition */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Diet",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="fork.knife" color={color} />,
        }}
      />
      {/* Workouts */}
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="dumbbell.fill" color={color} />,
        }}
      />
      {/* Biomarkers / Labs */}
      <Tabs.Screen
        name="biomarkers"
        options={{
          title: "Labs",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="chart.bar.fill" color={color} />,
        }}
      />
      {/* Supplements */}
      <Tabs.Screen
        name="supplements"
        options={{
          title: "Supps",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="pills.fill" color={color} />,
        }}
      />
      {/* Medications */}
      <Tabs.Screen
        name="medications"
        options={{
          title: "Meds",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="cross.case.fill" color={color} />,
        }}
      />
      {/* Hydration */}
      <Tabs.Screen
        name="hydration"
        options={{
          title: "Water",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="drop.fill" color={color} />,
        }}
      />
      {/* Sleep */}
      <Tabs.Screen
        name="sleep"
        options={{
          title: "Sleep",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="moon.fill" color={color} />,
        }}
      />
      {/* Body Measurements */}
      <Tabs.Screen
        name="body"
        options={{
          title: "Body",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="ruler" color={color} />,
        }}
      />
      {/* Progress Photos */}
      <Tabs.Screen
        name="photos"
        options={{
          title: "Photos",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="camera.fill" color={color} />,
        }}
      />
      {/* Medical History */}
      <Tabs.Screen
        name="medical-history"
        options={{
          title: "Medical",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="cross.fill" color={color} />,
        }}
      />
      {/* HFL Products */}
      <Tabs.Screen
        name="products"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="bag.fill" color={color} />,
        }}
      />
      {/* Insights */}
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="lightbulb.fill" color={color} />,
        }}
      />
      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
