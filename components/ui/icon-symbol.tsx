// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chart.bar.fill": "bar-chart",
  "heart.text.square.fill": "favorite",
  "pills.fill": "medication",
  "person.fill": "person",
  "gearshape.fill": "settings",
  "lightbulb.fill": "lightbulb",
  "plus": "add",
  "trash.fill": "delete",
  "pencil": "edit",
  "checkmark": "check",
  "xmark": "close",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  "calendar": "calendar-today",
  "bell.fill": "notifications",
  "doc.fill": "description",
  "flame.fill": "local-fire-department",
  "bubble.left.and.bubble.right.fill": "chat",
  "stethoscope": "medical-services",
  "mic.fill": "mic",
  "speaker.wave.2.fill": "volume-up",
  "square.and.arrow.up": "share",
  "doc.on.doc": "content-copy",
  "fork.knife": "restaurant",
  "dumbbell.fill": "fitness-center",
  "cross.case.fill": "local-pharmacy",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
