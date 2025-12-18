/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0D7C8C"; // Deep teal
const tintColorDark = "#00C9D7"; // Vibrant cyan

export const Colors = {
  light: {
    text: "#11181C",
    textSecondary: "#687076",
    background: "#FFFFFF",
    surface: "#F8F9FA",
    tint: tintColorLight,
    accent: "#00C9D7", // Vibrant cyan
    accentSecondary: "#FF6B6B", // Coral
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    // Cycle phase colors
    menstruation: "#FF6B6B",
    follicular: "#6BB6FF",
    ovulation: "#FFD93D",
    luteal: "#B565D8",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    background: "#151718",
    surface: "#1E2022",
    tint: tintColorDark,
    accent: "#00C9D7",
    accentSecondary: "#FF6B6B",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    border: "#2D3135",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    // Cycle phase colors
    menstruation: "#FF6B6B",
    follicular: "#6BB6FF",
    ovulation: "#FFD93D",
    luteal: "#B565D8",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
