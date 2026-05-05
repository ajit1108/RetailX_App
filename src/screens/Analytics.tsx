import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Card, Menu, SegmentedButtons, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";

import FadeInView from "../components/FadeInView";
import Header from "../components/Header";
import { apiRequest } from "../services/apiClient";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

type Product = {
  name: string;
  totalSold: number;
  quantity: number;
};

type Prediction = {
  name: string;
  daysLeft: string;
};

export default function Analytics({ navigation }: any) {
  const [range, setRange] = useState("weekly");
  const [occasion, setOccasion] = useState("Diwali");
  const [customOccasion, setCustomOccasion] = useState("");
  const [occasionMenuVisible, setOccasionMenuVisible] = useState(false);
  const [salesData, setSalesData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [slowProducts, setSlowProducts] = useState<Product[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [suggestions, setSuggestions] = useState([
    "Sweets and chocolates",
    "Dry fruits",
    "Snacks and beverages",
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState<{
    label: string;
    value: number;
  } | null>(null);

  const chartData = useMemo(() => {
    if (range === "daily") {
      return {
        labels: labels.slice(-4),
        values: salesData.slice(-4),
      };
    }

    if (range === "monthly") {
      const chunkSize = Math.max(Math.ceil(salesData.length / 3), 1);
      const groupedValues: number[] = [];
      const groupedLabels: string[] = [];

      for (let index = 0; index < salesData.length; index += chunkSize) {
        const chunk = salesData.slice(index, index + chunkSize);
        groupedValues.push(chunk.reduce((sum, value) => sum + value, 0));
        groupedLabels.push(labels[index] || `P${groupedLabels.length + 1}`);
      }

      return {
        labels: groupedLabels,
        values: groupedValues,
      };
    }

    return { labels, values: salesData };
  }, [labels, range, salesData]);

  const loadAnalytics = useCallback(
    async ({ isRefreshing = false }: { isRefreshing?: boolean } = {}) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      await apiRequest<any>("/api/analytics", { cache: false })
      .then((response) => {
        if (response.weeklySales) {
          const nextLabels = response.weeklySales.labels || [];
          const nextValues = response.weeklySales.values || [];
          setLabels(nextLabels);
          setSalesData(nextValues);
          if (nextLabels.length && nextValues.length) {
            setSelectedPoint({
              label: nextLabels[nextValues.length - 1],
              value: nextValues[nextValues.length - 1],
            });
          }
        }
        if (response.topSellingProducts) {
          setTopProducts(response.topSellingProducts);
        }
        if (response.slowMovingProducts) {
          setSlowProducts(response.slowMovingProducts);
        }
        const mlPredictions = response.stockPrediction?.predictions;
        if (Array.isArray(mlPredictions)) {
          setPredictions(
            mlPredictions.map((item: any) => ({
              name: item.name,
              daysLeft: String(item.daysLeft ?? item.days_left ?? "0"),
            }))
          );
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      });
    },
    []
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleOccasionInsight = async () => {
    const selectedOccasion = occasion === "Others" ? customOccasion.trim() : occasion;

    if (!selectedOccasion) {
      return;
    }

    try {
      const response = await apiRequest<any>("/api/analytics/occasion", {
        method: "POST",
        body: { occasion: selectedOccasion },
      });
      if (Array.isArray(response.suggestions)) {
        setSuggestions(response.suggestions);
      }
    } catch {
      // Keep default suggestions visible when the API is unavailable.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAnalytics({ isRefreshing: true })}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <FadeInView>
          <Header navigation={navigation} />

          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>ANALYTICS HUB</Text>
              <Text style={styles.heroTitle}>Turn daily sales into smart decisions</Text>
              <Text style={styles.heroText}>
                Spot trends early, compare performance, and prepare for demand.
              </Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="analytics-outline" size={24} color={palette.white} />
            </View>
          </View>

          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Sales Overview</Text>
            <SegmentedButtons
              value={range}
              onValueChange={setRange}
              buttons={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
              density="small"
            />
          </View>
          {loading ? (
            <Card style={styles.chartCard}>
              <Card.Content style={styles.chartLoading}>
                <ActivityIndicator color={palette.primary} />
                <Text style={styles.chartHint}>Loading analytics...</Text>
              </Card.Content>
            </Card>
          ) : chartData.values.length > 0 ? (
            <Card style={styles.chartCard}>
              <Card.Content
                onLayout={(event) =>
                  setChartWidth(Math.max(event.nativeEvent.layout.width - 32, 220))
                }
              >
                <View style={styles.chartSummary}>
                  <Text style={styles.chartSummaryLabel}>
                    {selectedPoint?.label || chartData.labels[chartData.labels.length - 1]}
                  </Text>
                  <Text style={styles.chartSummaryValue}>
                    Rs {Number(selectedPoint?.value || 0).toFixed(0)}
                  </Text>
                  <Text style={styles.chartHint}>Tap a point to inspect a day or period.</Text>
                </View>
                <LineChart
                  data={{ labels: chartData.labels, datasets: [{ data: chartData.values }] }}
                  width={chartWidth || 280}
                  height={220}
                  yAxisLabel="Rs "
                  chartConfig={{
                    backgroundColor: palette.surface,
                    backgroundGradientFrom: palette.surface,
                    backgroundGradientTo: palette.surface,
                    decimalPlaces: 0,
                    color: () => palette.primary,
                    labelColor: () => palette.subtext,
                    strokeWidth: 3,
                    fillShadowGradientFrom: palette.primary,
                    fillShadowGradientFromOpacity: 0.16,
                    fillShadowGradientToOpacity: 0.02,
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: palette.primaryDark,
                    },
                  }}
                  bezier
                  withInnerLines
                  withOuterLines={false}
                  fromZero
                  withShadow
                  segments={4}
                  onDataPointClick={({ value, index }) =>
                    setSelectedPoint({
                      label: chartData.labels[index] || `Point ${index + 1}`,
                      value,
                    })
                  }
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.chartCard}>
              <Card.Content style={styles.chartLoading}>
                <Text style={styles.chartHint}>No sales trend data is available yet.</Text>
              </Card.Content>
            </Card>
          )}

          <Text style={styles.sectionTitle}>Top Selling</Text>
          {topProducts.map((item) => (
            <View key={item.name} style={styles.listCard}>
              <View style={styles.listLeft}>
                <View style={styles.listIcon}>
                  <Ionicons name="trending-up-outline" size={18} color={palette.success} />
                </View>
                <Text style={styles.listText}>{item.name}</Text>
              </View>
              <Text style={styles.listHighlight}>{item.totalSold} sold</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Slow Moving</Text>
          {slowProducts.map((item) => (
            <View key={item.name} style={styles.listCard}>
              <View style={styles.listLeft}>
                <View style={styles.listIcon}>
                  <Ionicons name="hourglass-outline" size={18} color={palette.warning} />
                </View>
                <Text style={styles.listText}>{item.name}</Text>
              </View>
              <Text style={styles.listSubtle}>{item.totalSold} sold</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Stock Prediction</Text>
          {predictions.map((item) => (
            <View key={item.name} style={styles.listCard}>
              <View style={styles.listLeft}>
                <View style={styles.listIcon}>
                  <Ionicons name="time-outline" size={18} color={palette.primary} />
                </View>
                <Text style={styles.listText}>{item.name}</Text>
              </View>
              <Text style={styles.listHighlight}>{item.daysLeft} days left</Text>
            </View>
          ))}

          <Card style={styles.insightCard}>
            <Card.Content>
              <Text style={styles.insightTitle}>Smart Occasion Insights</Text>
              <Text style={styles.insightSubtext}>
                Choose a festival quickly, or type your own only when you need a custom one.
              </Text>

              <Menu
                visible={occasionMenuVisible}
                onDismiss={() => setOccasionMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    textColor={palette.text}
                    style={styles.dropdownButton}
                    onPress={() => setOccasionMenuVisible(true)}
                    icon="chevron-down"
                    contentStyle={styles.dropdownContent}
                  >
                    {occasion}
                  </Button>
                }
              >
                {["Diwali", "Christmas", "Eid", "Others"].map((item) => (
                  <Menu.Item
                    key={item}
                    title={item}
                    onPress={() => {
                      setOccasion(item);
                      if (item !== "Others") {
                        setCustomOccasion("");
                      }
                      setOccasionMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>

              {occasion === "Others" ? (
                <TextInput
                  mode="outlined"
                  placeholder="Enter custom occasion"
                  value={customOccasion}
                  onChangeText={setCustomOccasion}
                  style={styles.input}
                  outlineColor={palette.border}
                  activeOutlineColor={palette.primary}
                />
              ) : null}

              <Button
                mode="contained"
                buttonColor={palette.primary}
                textColor={palette.white}
                style={styles.insightBtn}
                icon="lightbulb-on-outline"
                onPress={handleOccasionInsight}
                disabled={occasion === "Others" && customOccasion.trim().length === 0}
              >
                Get Suggestions
              </Button>

              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>Suggested stock increase</Text>
                {suggestions.map((item) => (
                  <Text key={item} style={styles.resultText}>
                    {item}
                  </Text>
                ))}
              </View>
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
  heroCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    ...shadow,
  },
  heroCopy: {
    flex: 1,
    paddingRight: spacing.md,
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
  },
  heroText: {
    color: "#d1fae5",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  chartHeader: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chartCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  chartSummary: {
    marginBottom: spacing.sm,
  },
  chartSummaryLabel: {
    color: palette.subtext,
    fontSize: 13,
    fontWeight: "600",
  },
  chartSummaryValue: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 2,
  },
  chartHint: {
    color: palette.subtext,
    marginTop: 4,
  },
  chartLoading: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  chart: {
    borderRadius: radii.md,
  },
  listCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadow,
  },
  listLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  listText: {
    color: palette.text,
    fontWeight: "700",
  },
  listHighlight: {
    color: palette.primaryDark,
    fontWeight: "700",
  },
  listSubtle: {
    color: palette.subtext,
    fontWeight: "600",
  },
  insightCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
    ...shadow,
  },
  insightTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  insightSubtext: {
    color: palette.subtext,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  input: {
    backgroundColor: palette.surface,
    marginBottom: spacing.sm,
  },
  dropdownButton: {
    borderRadius: radii.md,
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  dropdownContent: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    minHeight: 52,
  },
  insightBtn: {
    borderRadius: radii.md,
  },
  resultBox: {
    marginTop: spacing.md,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: palette.surfaceMuted,
  },
  resultTitle: {
    color: palette.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  resultText: {
    color: palette.primaryDark,
    marginTop: 2,
  },
});
