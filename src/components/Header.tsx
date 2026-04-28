import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Badge, Avatar } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

import ScalePressable from "./ScalePressable";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

type Props = {
  navigation: any;
  notificationCount?: number;
};

export default function Header({
  navigation,
  notificationCount = 0,
}: Props) {
  return (
    <View style={styles.container}>
      <ScalePressable onPress={() => navigation.navigate("Profile")} style={styles.profileWrap}>
        <View style={styles.profileButton}>
          <Avatar.Text size={42} label="A" color={palette.white} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>retailX</Text>
          </View>
        </View>
      </ScalePressable>

      <View style={styles.actions}>
        <ScalePressable onPress={() => navigation.navigate("Settings")} style={styles.iconWrap}>
          <View style={styles.iconButton}>
            <Ionicons name="settings-outline" size={21} color={palette.text} />
          </View>
        </ScalePressable>

        <ScalePressable
          onPress={() => navigation.navigate("Notifications")}
          style={styles.iconWrap}
        >
          <View style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={palette.text} />
            {notificationCount > 0 ? <Badge style={styles.badge}>{notificationCount}</Badge> : null}
          </View>
        </ScalePressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  profileWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    backgroundColor: palette.primary,
  },
  greeting: {
    color: palette.subtext,
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.text,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrap: {
    borderRadius: radii.pill,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 3,
    backgroundColor: palette.danger,
    color: palette.white,
  },
});
