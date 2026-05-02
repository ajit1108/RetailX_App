import React from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ioniconGlyphMap from "react-native-vector-icons/glyphmaps/Ionicons.json";

const validIoniconNames = new Set(Object.keys(ioniconGlyphMap));

const iconNameMap: Record<string, string> = {
  "home-outline": "home-outline",
  "cube-outline": "cube-outline",
  "receipt-outline": "receipt-outline",
  "bar-chart-outline": "bar-chart-outline",
  "text-box-search-outline": "document-text-outline",
  "barcode-scan": "barcode-outline",
  "content-save-outline": "save-outline",
  "email-outline": "mail-outline",
  "lock-outline": "lock-closed-outline",
  magnify: "search-outline",
  numeric: "calculator-outline",
  "lightbulb-on-outline": "bulb-outline",
  "cart-plus": "cart-outline",
  "receipt-text-check-outline": "receipt-outline",
  broom: "trash-outline",
  "pencil-outline": "create-outline",
  "cog-outline": "settings-outline",
  logout: "log-out-outline",
  plus: "add",
  "eye-outline": "eye-outline",
  "phone-outline": "call-outline",
  "calendar-month-outline": "calendar-outline",
  "trash-outline": "trash-outline",
};

type Props = {
  color?: string;
  name?: any;
  size?: number;
  source?: any;
  style?: StyleProp<ImageStyle>;
};

export default function AppIcon({
  color = "#0f172a",
  name,
  size = 22,
  source,
  style,
}: Props) {
  const resolvedSource = source ?? name;

  if (typeof resolvedSource === "function") {
    return resolvedSource({ color, size });
  }

  if (typeof resolvedSource === "string") {
    const iconName = iconNameMap[resolvedSource]
      ?? (validIoniconNames.has(resolvedSource) ? resolvedSource : "help-circle-outline");
    return <Ionicons name={iconName as any} size={size} color={color} />;
  }

  if (resolvedSource && typeof resolvedSource === "object") {
    return (
      <Image
        source={resolvedSource}
        style={[{ width: size, height: size, tintColor: color }, style]}
      />
    );
  }

  return <Ionicons name="help-circle-outline" size={size} color={color} />;
}
