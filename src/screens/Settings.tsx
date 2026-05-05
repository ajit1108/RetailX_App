import React, { useCallback, useEffect, useState } from "react";
import { Linking, RefreshControl, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

const preferences = [
  {
    key: "alerts",
    title: "Low stock alerts",
    subtitle: "Get notified when fast-moving items need restocking.",
    icon: "notifications-outline",
  },
  {
    key: "insights",
    title: "Weekly insights",
    subtitle: "Receive sales and performance highlights every week.",
    icon: "analytics-outline",
  },
  {
    key: "receipts",
    title: "Auto-save receipts",
    subtitle: "Keep billing records stored for quick lookup later.",
    icon: "document-text-outline",
  },
];

export default function Settings({ navigation }: any) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    alerts: true,
    insights: true,
    receipts: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadSettings = useCallback(
    async ({ isRefreshing = false }: { isRefreshing?: boolean } = {}) => {
      if (isRefreshing) {
        setRefreshing(true);
      }

      await apiRequest<any>("/api/settings", { cache: false })
      .then((response) => {
        setEnabled({
          alerts: Boolean(response.preferences?.lowStockAlerts),
          insights: Boolean(response.preferences?.weeklyInsights),
          receipts: Boolean(response.preferences?.autoSaveReceipts),
        });
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
    loadSettings();
  }, [loadSettings]);

  const handlePreferenceChange = (key: string, value: boolean) => {
    const nextEnabled = { ...enabled, [key]: value };
    setEnabled(nextEnabled);

    apiRequest("/api/settings", {
      method: "PUT",
      body: {
        lowStockAlerts: nextEnabled.alerts,
        weeklyInsights: nextEnabled.insights,
        autoSaveReceipts: nextEnabled.receipts,
      },
    }).catch(() => undefined);
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSettings({ isRefreshing: true })}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <FadeInView>
          <View style={styles.header}>
            <ScalePressable onPress={() => navigation.goBack()} style={styles.iconWrap}>
              <View style={styles.iconButton}>
                <Ionicons name="arrow-back" size={20} color={palette.text} />
              </View>
            </ScalePressable>

            <Text style={styles.headerTitle}>Settings</Text>

            <View style={styles.iconPlaceholder} />
          </View>

          <Card style={styles.heroCard}>
            <Card.Content>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.heroEyebrow}>STORE PREFERENCES</Text>
                  <Text style={styles.heroTitle}>Keep RetailX working your way</Text>
                </View>
                <View style={styles.heroIcon}>
                  <Ionicons name="settings-outline" size={22} color={palette.white} />
                </View>
              </View>
              <Text style={styles.heroText}>
                Manage alerts, records, and smart reminders without changing any
                core app behavior.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.sectionCard}>
            <Card.Content>
              {preferences.map((item, index) => (
                <View key={item.key}>
                  <View style={styles.preferenceRow}>
                    <View style={styles.preferenceIcon}>
                      <Ionicons name={item.icon as any} size={20} color={palette.primaryDark} />
                    </View>
                    <View style={styles.preferenceTextWrap}>
                      <Text style={styles.preferenceTitle}>{item.title}</Text>
                      <Text style={styles.preferenceSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Switch
                      value={enabled[item.key]}
                      thumbColor={palette.white}
                      trackColor={{ false: "#cbd5e1", true: palette.primary }}
                      onValueChange={(value) => handlePreferenceChange(item.key, value)}
                    />
                  </View>
                  {index < preferences.length - 1 ? <Divider style={styles.divider} /> : null}
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Help & Support</Text>
              <View style={styles.supportCard}>
                <Text style={styles.supportTitle}>Contact</Text>
                <Text style={styles.supportText}>Email: support@retailx.com</Text>
                <Text style={styles.supportText}>Phone: +91 98765 43210</Text>
                <View style={styles.supportActionRow}>
                  <Button
                    mode="outlined"
                    textColor={palette.primaryDark}
                    style={styles.supportButton}
                    onPress={() => handleOpenLink("mailto:support@retailx.com")}
                  >
                    Email Support
                  </Button>
                  <Button
                    mode="outlined"
                    textColor={palette.primaryDark}
                    style={styles.supportButton}
                    onPress={() => handleOpenLink("tel:+919876543210")}
                  >
                    Call Now
                  </Button>
                </View>
              </View>

              <View style={styles.supportCard}>
                <Text style={styles.supportTitle}>FAQ</Text>
                <Text style={styles.faqQuestion}>How do I send bills on WhatsApp?</Text>
                <Text style={styles.supportText}>
                  Add products to the bill, enter the customer mobile number, and
                  generate the bill to send it to both customer and owner.
                </Text>
                <Text style={styles.faqQuestion}>Why is a product not appearing in search?</Text>
                <Text style={styles.supportText}>
                  Check that the product exists in inventory and try a partial keyword or barcode.
                </Text>
                <Text style={styles.faqQuestion}>What happens if WhatsApp delivery fails?</Text>
                <Text style={styles.supportText}>
                  Billing still completes, and you will see a delivery failure message instead of losing the bill.
                </Text>
              </View>

              <ScalePressable style={styles.linkRow}>
                <View style={styles.linkInner}>
                  <Ionicons name="help-circle-outline" size={20} color={palette.primaryDark} />
                  <Text style={styles.linkText}>Help center</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.subtext} />
              </ScalePressable>

              <ScalePressable style={styles.linkRow}>
                <View style={styles.linkInner}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={palette.primaryDark} />
                  <Text style={styles.linkText}>Privacy and security</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.subtext} />
              </ScalePressable>

              <Button
                mode="contained"
                buttonColor={palette.primary}
                textColor={palette.white}
                style={styles.reportButton}
                icon="alert-circle-outline"
                onPress={() => handleOpenLink("mailto:support@retailx.com?subject=RetailX%20Issue")}
              >
                Report Issue
              </Button>
            </Card.Content>
          </Card>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
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
  iconPlaceholder: {
    width: 42,
  },
  heroCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  heroEyebrow: {
    color: "#99f6e4",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing.xs,
    maxWidth: "80%",
  },
  heroText: {
    color: "#d1fae5",
    fontSize: 14,
    lineHeight: 20,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  preferenceIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  preferenceTextWrap: {
    flex: 1,
  },
  preferenceTitle: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 15,
  },
  preferenceSubtitle: {
    color: palette.subtext,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    marginVertical: spacing.xs,
    backgroundColor: "#e2e8f0",
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  supportCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  supportTitle: {
    color: palette.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  supportText: {
    color: palette.subtext,
    lineHeight: 19,
    marginTop: 2,
  },
  faqQuestion: {
    color: palette.primaryDark,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  supportActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  supportButton: {
    flex: 1,
    borderRadius: radii.md,
  },
  linkRow: {
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  linkInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  linkText: {
    color: palette.text,
    fontWeight: "600",
  },
  reportButton: {
    marginTop: spacing.xs,
    borderRadius: radii.md,
  },
});
