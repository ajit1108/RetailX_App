import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import Header from "../components/Header";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
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
    title: "Items Scanned",
    value: "142",
    change: "Busy period . Last scan 4m ago",
    icon: "barcode-outline",
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
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    apiRequest<any>("/api/dashboard")
      .then(setDashboard)
      .catch(() => undefined);
  }, []);

  const cards = dashboard
    ? [
        {
          title: "Total Sales Today",
          value: `Rs ${Number(dashboard.summary?.todaySales || 0).toFixed(2)}`,
          change: `${dashboard.summary?.todayBillCount || 0} bills today`,
          icon: "trending-up-outline",
          accent: palette.success,
        },
        {
          title: "Items Scanned",
          value: String(dashboard.summary?.todayItemsSold || 0),
          change: `${dashboard.summary?.totalProducts || 0} products in stock`,
          icon: "barcode-outline",
          accent: palette.accent,
        },
      ]
    : overviewCards;
  const activeAlerts = dashboard?.priorityAlerts?.length
    ? dashboard.priorityAlerts.map((item: any) => ({
        title: item.title,
        subtitle: item.message,
        icon: "warning-outline",
        color: palette.danger,
      }))
    : alerts;
  const topItems = dashboard?.topPerformingItems?.length
    ? dashboard.topPerformingItems.map((item: any, index: number) => ({
        title: item.name,
        subtitle: `${item.totalSold} units sold today`,
        tag: index === 0 ? "Best seller" : "Active",
      }))
    : performers;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView>
          <Header
            navigation={navigation}
            notificationCount={dashboard?.summary?.unreadNotificationCount ?? 3}
          />

          <View style={styles.heroCard}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroEyebrow}>STORE SNAPSHOT</Text>
              <Text style={styles.heroTitle}>Your shop is moving well today</Text>
              <Text style={styles.heroSubtitle}>
                Sales are healthy, inventory needs attention, and billing is ready
                for the next rush.
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="storefront-outline" size={26} color={palette.white} />
            </View>
          </View>

          <View style={styles.cardGrid}>
            {cards.map((card) => (
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

          {activeAlerts.map((item: any) => (
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
            <Text style={styles.sectionMeta}>This week</Text>
          </View>

          {topItems.map((item: any, index: number) => (
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
                name={index === 0 ? "sparkles-outline" : "trending-up-outline"}
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
