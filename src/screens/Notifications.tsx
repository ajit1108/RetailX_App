import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Badge, Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  isRead: boolean;
};

export default function Notifications({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const badgeScale = useRef(new Animated.Value(1)).current;

  const loadNotifications = useCallback(
    async ({ isRefreshing = false }: { isRefreshing?: boolean } = {}) => {
      if (isRefreshing) {
        setRefreshing(true);
      }

      await apiRequest<any>("/api/notifications", { cache: false })
      .then((response) => {
        if (Array.isArray(response.notifications)) {
          setNotifications(
            response.notifications.map((item: any) => ({
              id: item._id,
              title: item.title,
              message: item.message,
              time: new Date(item.createdAt).toLocaleString(),
              icon: item.icon || "notifications-outline",
              isRead: Boolean(item.isRead),
            }))
          );
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isRefreshing) {
          setRefreshing(false);
        }
      });
    },
    []
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const animateBadge = () => {
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.18,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScale, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const clearAll = () => {
    setNotifications([]);
    animateBadge();
    apiRequest("/api/notifications", { method: "DELETE" }).catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FadeInView style={styles.content}>
        <View style={styles.header}>
          <ScalePressable onPress={() => navigation.goBack()} style={styles.iconWrap}>
            <View style={styles.iconButton}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </View>
          </ScalePressable>

          <Text style={styles.headerTitle}>Notifications</Text>

          <Animated.View style={[styles.badgeWrap, { transform: [{ scale: badgeScale }] }]}>
            <Badge style={styles.badge}>{unreadCount}</Badge>
          </Animated.View>
        </View>

        {notifications.length > 0 ? (
          <Button
            mode="contained"
            buttonColor={palette.primary}
            textColor={palette.white}
            style={styles.clearBtn}
            onPress={clearAll}
            icon="broom"
          >
            Clear All
          </Button>
        ) : null}

        {notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={28} color={palette.primaryDark} />
            </View>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>New alerts will appear here when something needs attention.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadNotifications({ isRefreshing: true })}
                tintColor={palette.primary}
                colors={[palette.primary]}
              />
            }
            renderItem={({ item, index }) => (
              <FadeInView delay={index * 40}>
                <Card style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.iconBadge}>
                      <Ionicons name={item.icon as any} size={20} color={palette.primaryDark} />
                    </View>
                    <View style={styles.cardText}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                      </View>
                      <Text style={styles.message}>{item.message}</Text>
                    </View>
                  </Card.Content>
                </Card>
              </FadeInView>
            )}
          />
        )}
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
  },
  iconWrap: {
    borderRadius: radii.pill,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  badgeWrap: {
    width: 42,
    alignItems: "center",
  },
  badge: {
    backgroundColor: palette.primary,
    color: palette.white,
  },
  clearBtn: {
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    ...shadow,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  cardText: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    color: palette.text,
    fontWeight: "700",
    flex: 1,
  },
  time: {
    color: palette.subtext,
    fontSize: 12,
  },
  message: {
    color: palette.subtext,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  emptyText: {
    color: palette.subtext,
    marginTop: spacing.xs,
    textAlign: "center",
    lineHeight: 20,
  },
});
