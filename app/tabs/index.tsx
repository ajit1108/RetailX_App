import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}
  showsVerticalScrollIndicator={false} style={styles.container}>

        {/* HEADER */}
       <View style={styles.header}>

  {/* LEFT - Profile + Name */}
  <TouchableOpacity 
    style={styles.profile}
    onPress={() => router.push("/profile")}
  >
    <Ionicons name="person-circle" size={40} color="#22c55e" />
    <Text style={styles.title}>RetailX</Text>
  </TouchableOpacity>

  {/* RIGHT - Only Notification */}
  <Ionicons name="notifications-outline" size={24} />

</View>

        {/* SALES CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>TOTAL SALES TODAY</Text>
          <Text style={styles.bigText}>₹4,280.50</Text>
          <Text style={styles.greenText}>+12.5% vs yesterday</Text>
        </View>

        {/* ITEMS SCANNED */}
        <View style={styles.card}>
          <Text style={styles.label}>ITEMS SCANNED</Text>
          <Text style={styles.bigText}>142</Text>
          <Text style={styles.grayText}>Busy Period • Last scan 4m ago</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.row}>

          {/* SCAN */}
          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="barcode-outline" size={22} color="#fff" />
            <Text style={styles.btnText}> Scan New Stock</Text>
          </TouchableOpacity>

          {/* INVOICE */}
          <TouchableOpacity style={styles.secondaryBtn}>
            <Ionicons name="document-text-outline" size={22} color="#334155" />
            <Text style={styles.secondaryText}> Create Invoice</Text>
          </TouchableOpacity>

        </View>

        {/* STOCK ALERTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stock Alerts</Text>
            <Text style={styles.urgent}>3 URGENT ISSUES</Text>
          </View>

          <View style={styles.alertBox}>
            <Ionicons name="warning-outline" size={20} color="#ef4444" />
            <Text style={styles.alertText}>
              Whole Milk • Low Stock (2 left)
            </Text>
          </View>

          <View style={styles.alertBox}>
            <Ionicons name="time-outline" size={20} color="#f59e0b" />
            <Text style={styles.alertText}>
              Salad • Expires in 2 days
            </Text>
          </View>
        </View>

        {/* TOP PERFORMING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Items</Text>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>BEST SELLER</Text>
            <Text style={styles.highlightTitle}>Artisan Bread</Text>
            <Text style={styles.whiteText}>420 units sold this week</Text>
          </View>

          <View style={styles.smallCard}>
            <Text>#2 Coffee Beans</Text>
            <Text>285 Units • +5%</Text>
          </View>

          <View style={styles.smallCard}>
            <Text>#3 Avocados</Text>
            <Text>212 Units • Stable</Text>
          </View>
        </View>

       
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f1f5f9",
    padding: 15,
    
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },

  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },

  label: {
    fontSize: 12,
    color: "#64748b",
  },

  bigText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },

  greenText: {
    color: "#22c55e",
  },

  grayText: {
    color: "#64748b",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  primaryBtn: {
    backgroundColor: "#064e3b",
    padding: 15,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },

  secondaryBtn: {
    backgroundColor: "#cbd5e1",
    padding: 15,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  secondaryText: {
    color: "#334155",
    fontWeight: "500",
  },

  section: {
    marginTop: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  urgent: {
    color: "#ef4444",
    fontSize: 12,
  },

  alertBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  alertText: {
    flex: 1,
  },

  highlightCard: {
    backgroundColor: "#064e3b",
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },

  highlightLabel: {
    color: "#a7f3d0",
    fontSize: 12,
  },

  highlightTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  whiteText: {
    color: "#fff",
  },

  smallCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

});