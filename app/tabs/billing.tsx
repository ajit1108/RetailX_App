import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ScrollView } from "react-native";

const billItems = [
  { id: "1", name: "Organic Whole Milk", price: 7.0, qty: 2 },
  { id: "2", name: "Sourdough Bread", price: 4.25, qty: 1 },
  { id: "3", name: "Free-Range Eggs (12pk)", price: 5.9, qty: 1 },
];

const categories = [
  { name: "Milk", icon: "cafe-outline" },
  { name: "Bread", icon: "fast-food-outline" },
  { name: "Fruits", icon: "nutrition-outline" },
  { name: "Dairy", icon: "water-outline" },
];

export default function Billing() {
  const [qty, setQty] = useState("1");

  const subtotal = billItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>RetailX</Text>
          <Ionicons name="notifications-outline" size={22} />
        </View>

        {/* TITLE */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>New Transaction</Text>
          <Text style={styles.subtitle}>
            Add items to generate a customer bill
          </Text>
        </View>

        {/* OCR CARD */}
        <View style={styles.ocrCard}>
          <Ionicons name="scan-outline" size={26} color="#fff" />
          <Text style={styles.ocrTitle}>Scan Item using OCR</Text>
          <Text style={styles.ocrText}>
            Quickly add items using barcode or product labels
          </Text>

          <TouchableOpacity style={styles.scanBtn}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              LAUNCH SCANNER →
            </Text>
          </TouchableOpacity>
        </View>

        {/* MANUAL ENTRY */}
        <Text style={styles.sectionTitle}>Manual Entry</Text>

        <View style={styles.inputBox}>
          <Ionicons name="search-outline" size={18} />
          <TextInput placeholder="Search product..." style={{ flex: 1 }} />
          <Ionicons name="chevron-down" size={18} />
        </View>

        <View style={styles.qtyBox}>
          <Text style={{ fontWeight: "600", marginBottom: 5 }}>
            Enter Quantity
          </Text>
          <View style={styles.qtyInput}>
            <Text style={{ fontSize: 18 }}>#</Text>
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="cart-outline" size={18} color="#fff" />
          <Text style={styles.addText}>Add to Bill</Text>
        </TouchableOpacity>

        {/* CATEGORY GRID */}
        <Text style={styles.sectionTitle}>Categories</Text>

        <View style={styles.grid}>
          {categories.map((c, i) => (
            <View key={i} style={styles.gridItem}>
              <Ionicons name={c.icon as any} size={22} />
              <Text style={{ marginTop: 5 }}>{c.name}</Text>
            </View>
          ))}
        </View>

        {/* BILL CARD */}
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Current Bill
            </Text>
            <Text style={{ color: "#cbd5e1" }}>TXN-99812</Text>
          </View>

          <FlatList
            data={billItems}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                <Text>
                  ${item.price} x {item.qty}
                </Text>
              </View>
            )}
          />

          <View style={styles.row}>
            <Text style={{ color: "#fff" }}>Subtotal</Text>
            <Text style={{ color: "#fff" }}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={{ color: "#fff" }}>Tax (5%)</Text>
            <Text style={{ color: "#fff" }}>${tax.toFixed(2)}</Text>
          </View>

          <View style={styles.total}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              GRAND TOTAL
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
              ${total.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity style={styles.genBtn}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Generate Bill
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Stock will be automatically updated after billing
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },

  titleBlock: {
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 3,
  },

  subtitle: {
    color: "#6b7280",
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 15,
  },

  ocrCard: {
    backgroundColor: "#064e3b",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  ocrTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },

  ocrText: {
    color: "#d1fae5",
    marginTop: 5,
    fontSize: 12,
  },

  scanBtn: {
    marginTop: 10,
  },

  inputBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  qtyBox: {
    marginTop: 12,
  },

  qtyInput: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 10,
  },

  addBtn: {
    flexDirection: "row",
    backgroundColor: "#064e3b",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    justifyContent: "center",
    gap: 10,
  },

  addText: {
    color: "#fff",
    fontWeight: "bold",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  gridItem: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  billCard: {
    backgroundColor: "#064e3b",
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
  },

  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  item: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#0f766e",
    paddingTop: 10,
  },

  genBtn: {
    backgroundColor: "#022c22",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },

  note: {
    color: "#d1fae5",
    fontSize: 10,
    marginTop: 10,
    textAlign: "center",
  },
});