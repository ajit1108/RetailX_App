import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import Header from "../components/Header";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
import { BILL_CREATED_EVENT, subscribeToAppEvent } from "../services/appEvents";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

const overviewCards = [
  {
    title: "Total Sales Today",
    value: "Rs 4,280.50",
    change: "+12.5% vs yesterday",
    icon: "trending-up-outline",
    accent: palette.success,
  },
  {
    title: "Number of Scans",
    value: "18",
    change: "Track today's scan activity",
    icon: "scan-outline",
    accent: palette.accent,
  },
];

const alerts = [
  {
    title: "Whole Milk",
    subtitle: "Low stock . 2 units left",
    icon: "warning-outline",
    color: palette.danger,
  },
  {
    title: "Fresh Salad",
    subtitle: "Expires in 2 days",
    icon: "time-outline",
    color: palette.warning,
  },
  {
    title: "Olive Oil",
    subtitle: "Reorder suggested tomorrow",
    icon: "cube-outline",
    color: palette.primary,
  },
];

const performers = [
  { title: "Artisan Bread", subtitle: "420 units sold this week", tag: "Best seller" },
  { title: "Coffee Beans", subtitle: "285 units . 5% growth", tag: "Rising fast" },
  { title: "Avocados", subtitle: "212 units . Stable repeat demand", tag: "Consistent" },
];

export default function Dashboard({ navigation }: any) {
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(
    async ({ isRefreshing = false }: { isRefreshing?: boolean } = {}) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [dashboardResponse, analyticsResponse] = await Promise.all([
          apiRequest<any>("/api/dashboard", { cache: false }),
          apiRequest<any>("/api/analytics", { cache: false }),
        ]);

        setDashboardSummary(dashboardResponse?.summary ?? null);
        setAnalyticsSummary(analyticsResponse?.todaySummary ?? null);
      } catch {
        setDashboardSummary(null);
        setAnalyticsSummary(null);
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
    const unsubscribeFocus = navigation.addListener("focus", () => {
      loadDashboard();
    });
    const unsubscribeBillCreated = subscribeToAppEvent(BILL_CREATED_EVENT, () => {
      loadDashboard();
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBillCreated();
    };
  }, [loadDashboard, navigation]);

  const hasLiveSummary = Boolean(dashboardSummary || analyticsSummary);

  const cards = hasLiveSummary
    ? [
        {
          title: "Total Sales Today",
          value: `Rs ${Number(analyticsSummary?.totalSales || 0).toFixed(2)}`,
          change: `${analyticsSummary?.billCount || 0} bills completed today`,
          icon: "trending-up-outline",
          accent: palette.success,
        },
        {
          title: "Number of Scans",
          value: String(analyticsSummary?.scanCount || 0),
          change: `${analyticsSummary?.totalItemsSold || 0} items sold today`,
          icon: "scan-outline",
          accent: palette.accent,
        },
      ]
    : overviewCards;
  const activeAlerts = alerts;
  const topItems = performers;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard({ isRefreshing: true })}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <FadeInView>
          <Header
            navigation={navigation}
            notificationCount={dashboardSummary?.unreadNotificationCount ?? 0}
          />

          <View style={styles.heroCard}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroEyebrow}>STORE SNAPSHOT</Text>
              <Text style={styles.heroTitle}>Your shop is moving well today</Text>
              <Text style={styles.heroSubtitle}>
                {hasLiveSummary
                  ? `${analyticsSummary?.billCount || 0} bills generated, ${analyticsSummary?.totalItemsSold || 0} items sold, and ${dashboardSummary?.lowStockCount || 0} products need attention.`
                  : "Sales are healthy, inventory needs attention, and billing is ready for the next rush."}
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="storefront-outline" size={26} color={palette.white} />
            </View>
          </View>

          <View style={styles.cardGrid}>
            {loading
              ? [0, 1].map((card) => (
                  <View key={card} style={styles.metricCard}>
                    <ActivityIndicator color={palette.primary} />
                  </View>
                ))
              : cards.map((card) => (
                  <View key={card.title} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>{card.title}</Text>
                      <View style={[styles.metricIcon, { backgroundColor: `${card.accent}20` }]}>
                        <Ionicons name={card.icon as any} size={20} color={card.accent} />
                      </View>
                    </View>
                    <Text style={styles.metricValue}>{card.value}</Text>
                    <Text style={[styles.metricChange, { color: card.accent }]}>
                      {card.change}
                    </Text>
                  </View>
                ))}
          </View>

          <View style={styles.actionRow}>
            <ScalePressable
              style={styles.primaryActionWrap}
              onPress={() => navigation.navigate("AddProduct")}
            >
              <View style={styles.primaryAction}>
                <Ionicons name="add-circle-outline" size={22} color={palette.white} />
                <Text style={styles.primaryActionText}>Add New Stock</Text>
              </View>
            </ScalePressable>

            <ScalePressable
              style={styles.secondaryActionWrap}
              onPress={() => navigation.navigate("ProductDetails")}
            >
              <View style={styles.secondaryAction}>
                <Ionicons name="receipt-outline" size={22} color={palette.primaryDark} />
                <Text style={styles.secondaryActionText}>View Details</Text>
              </View>
            </ScalePressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Priority Alerts</Text>
            <Text style={styles.sectionMeta}>{activeAlerts.length} active</Text>
          </View>

          {(loading ? [] : activeAlerts).map((item: any) => (
            <View key={item.title} style={styles.alertCard}>
              <View style={[styles.alertIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.subtext} />
            </View>
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Performing Items</Text>
            <Text style={styles.sectionMeta}>Today</Text>
          </View>

          {(loading ? [] : topItems).map((item: any, index: number) => (
            <View
              key={item.title}
              style={[styles.performerCard, index === 0 ? styles.performerFeatured : null]}
            >
              <View>
                <Text
                  style={[
                    styles.performerTag,
                    index === 0 ? styles.performerFeaturedTag : null,
                  ]}
                >
                  {item.tag}
                </Text>
                <Text
                  style={[
                    styles.performerTitle,
                    index === 0 ? styles.performerFeaturedTitle : null,
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.performerSubtitle,
                    index === 0 ? styles.performerFeaturedSubtitle : null,
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons
                name={index === 0 ? "trophy-outline" : "trending-up-outline"}
                size={22}
                color={index === 0 ? palette.white : palette.primary}
              />
            </View>
          ))}
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    ...shadow,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  heroEyebrow: {
    color: "#99f6e4",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 24,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    color: "#d1fae5",
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardGrid: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadow,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricLabel: {
    color: palette.subtext,
    fontSize: 13,
    fontWeight: "600",
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  metricChange: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryActionWrap: {
    flex: 1,
    borderRadius: radii.md,
  },
  primaryAction: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  primaryActionText: {
    color: palette.white,
    fontWeight: "700",
  },
  secondaryActionWrap: {
    flex: 1,
    borderRadius: radii.md,
  },
  secondaryAction: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryActionText: {
    color: palette.primaryDark,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionMeta: {
    color: palette.subtext,
    fontWeight: "600",
  },
  alertCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    ...shadow,
  },
  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    color: palette.text,
    fontWeight: "700",
  },
  alertSubtitle: {
    color: palette.subtext,
    marginTop: 2,
  },
  performerCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadow,
  },
  performerFeatured: {
    backgroundColor: palette.primaryDark,
  },
  performerTag: {
    color: palette.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  performerFeaturedTag: {
    color: "#99f6e4",
  },
  performerTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "700",
  },
  performerFeaturedTitle: {
    color: palette.white,
  },
  performerSubtitle: {
    color: palette.subtext,
    marginTop: 3,
  },
  performerFeaturedSubtitle: {
    color: "#d1fae5",
  },
});
