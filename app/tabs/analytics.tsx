import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { colors } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";

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

export default function Analytics() {
  const [salesData, setSalesData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [slowProducts, setSlowProducts] = useState<Product[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const sales = [500, 700, 400, 900, 1200, 800, 1500];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    setSalesData(sales);
    setLabels(days);

    const products: Product[] = [
      { name: "Milk", totalSold: 120, quantity: 20 },
      { name: "Bread", totalSold: 80, quantity: 5 },
      { name: "Chips", totalSold: 200, quantity: 50 },
      { name: "Soap", totalSold: 30, quantity: 40 },
    ];

    const top = [...products]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 3);

    const slow = [...products]
      .sort((a, b) => a.totalSold - b.totalSold)
      .slice(0, 3);

    const pred: Prediction[] = products.map((p) => {
      const avg = p.totalSold / 7;
      const daysLeft = avg > 0 ? p.quantity / avg : 0;

      return {
        name: p.name,
        daysLeft: daysLeft.toFixed(1),
      };
    });

    setTopProducts(top);
    setSlowProducts(slow);
    setPredictions(pred);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
            <View style={styles.header}>
              
              <Text style={styles.logo}>RetailX</Text>
              <Ionicons name="notifications-outline" size={22} />
            </View>

        <Text style={styles.title}>📊 Analytics</Text>

        {/* SALES CHART */}
        <Text style={styles.section}>Weekly Sales</Text>

        {salesData.length > 0 && (
          <LineChart
            data={{
              labels,
              datasets: [{ data: salesData }],
            }}
            width={screenWidth - 20}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => "#333",
              propsForDots: {
                r: "4",
              },
            }}
            style={styles.chart}
          />
        )}

        {/* TOP PRODUCTS */}
        <Text style={styles.section}>🔥 Top Selling Products</Text>
        {topProducts.map((item, index) => (
          <View key={`top-${index}`} style={styles.card}>
            <Text style={styles.cardText}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.totalSold} sold</Text>
          </View>
        ))}

        {/* SLOW PRODUCTS */}
        <Text style={styles.section}>🐢 Slow Moving Products</Text>
        {slowProducts.map((item, index) => (
          <View key={`slow-${index}`} style={styles.card}>
            <Text style={styles.cardText}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.totalSold} sold</Text>
          </View>
        ))}

        {/* AI PREDICTIONS */}
        <Text style={styles.section}>🤖 Stock Prediction</Text>
        {predictions.map((item, index) => (
          <View key={`pred-${index}`} style={styles.card}>
            <Text style={styles.cardText}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.daysLeft} days left</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 10,
  },

  section: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "600",
  },

  chart: {
    borderRadius: 12,
  },

  card: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardText: {
    fontWeight: "600",
  },

  cardSub: {
    color: "#555",
  },
   header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },

});