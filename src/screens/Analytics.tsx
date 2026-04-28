import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, SegmentedButtons, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";

import FadeInView from "../components/FadeInView";
import Header from "../components/Header";
import { apiRequest } from "../services/apiClient";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

const screenWidth = Dimensions.get("window").width;

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
  const [occasion, setOccasion] = useState("");
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

  const getFilteredChartData = () => {
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
  };

  const chartData = getFilteredChartData();

  useEffect(() => {
    const sales = [500, 700, 400, 900, 1200, 800, 1500];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const products: Product[] = [
      { name: "Milk", totalSold: 120, quantity: 20 },
      { name: "Bread", totalSold: 80, quantity: 5 },
      { name: "Chips", totalSold: 200, quantity: 50 },
      { name: "Soap", totalSold: 30, quantity: 40 },
    ];

    setSalesData(sales);
    setLabels(days);
    setTopProducts([...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 3));
    setSlowProducts([...products].sort((a, b) => a.totalSold - b.totalSold).slice(0, 3));
    setPredictions(
      products.map((product) => {
        const avg = product.totalSold / 7;
        return {
          name: product.name,
          daysLeft: (avg > 0 ? product.quantity / avg : 0).toFixed(1),
        };
      })
    );

    apiRequest<any>("/api/analytics")
      .then((response) => {
        if (response.weeklySales) {
          setLabels(response.weeklySales.labels || days);
          setSalesData(response.weeklySales.values || sales);
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
      .catch(() => undefined);
  }, []);

  const handleOccasionInsight = async () => {
    try {
      const response = await apiRequest<any>("/api/analytics/occasion", {
        method: "POST",
        body: { occasion },
      });
      if (Array.isArray(response.suggestions)) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      // Keep default suggestions visible when the API is unavailable.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <Header navigation={navigation} notificationCount={3} />

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
          {chartData.values.length > 0 ? (
            <Card style={styles.chartCard}>
              <Card.Content>
                <LineChart
                  data={{ labels: chartData.labels, datasets: [{ data: chartData.values }] }}
                  width={screenWidth - 60}
                  height={200}
                  yAxisLabel="Rs "
                  chartConfig={{
                    backgroundColor: palette.surface,
                    backgroundGradientFrom: palette.surface,
                    backgroundGradientTo: palette.surface,
                    decimalPlaces: 0,
                    color: () => palette.primary,
                    labelColor: () => palette.subtext,
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: palette.primaryDark,
                    },
                  }}
                  bezier
                  withInnerLines={false}
                  withOuterLines
                  fromZero
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          ) : null}

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
                Mention an event or local sale to get quick stocking suggestions.
              </Text>

              <TextInput
                mode="outlined"
                placeholder="Example: Diwali, weekend sale, wedding season"
                value={occasion}
                onChangeText={setOccasion}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />

              <Button
                mode="contained"
                buttonColor={palette.primary}
                textColor={palette.white}
                style={styles.insightBtn}
                icon="lightbulb-on-outline"
                onPress={handleOccasionInsight}
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
  chart: {
    borderRadius: radii.md,
    marginLeft: -12,
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
