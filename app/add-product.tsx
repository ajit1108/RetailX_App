import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function AddProduct() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      <ScrollView style={{ padding: 15 }} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
         
          <Text style={styles.headerTitle}>RetailX</Text>
        </View>

        {/* TITLE */}
        <Text style={styles.mainTitle}>New Product Entry</Text>
        <Text style={styles.subtitle}>
          Select your preferred method to catalog new arrivals into the RetailX ecosystem.
        </Text>

        {/* OCR CARD */}
        <View style={styles.ocrCard}>
          <Ionicons name="scan-outline" size={30} color="#fff" />
          <Text style={styles.ocrTitle}>Scan Box using OCR</Text>
          <Text style={styles.ocrText}>
            Instantly extract product name, SKU, and weight from packaging using precise optical recognition.
          </Text>

          <TouchableOpacity style={styles.ocrBtn}>
            <Text style={styles.ocrBtnText}>LAUNCH SCANNER →</Text>
          </TouchableOpacity>
        </View>

        {/* QUEUE STATUS */}
        <View style={styles.queueBox}>
          <Text style={styles.queueLabel}>QUEUE STATUS</Text>
          <Text style={styles.queueText}>0 Pending Uploads</Text>
        </View>

        {/* TIP */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Curator's Tip</Text>
          <Text style={styles.tipText}>
            For best OCR results, ensure the shipping label is flat and well-lit. Avoid scanning reflective plastic wrapping directly.
          </Text>
        </View>

        {/* MANUAL ENTRY */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>✏️ Manual Entry</Text>

          <Text style={styles.label}>PRODUCT NAME</Text>
          <TextInput style={styles.input} placeholder="e.g. Minimalist Ceramic Vase" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>QUANTITY</Text>
              <TextInput style={styles.input} placeholder="0" keyboardType="numeric" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>PRICE (USD)</Text>
              <TextInput style={styles.input} placeholder="$ 0.00" />
            </View>
          </View>

          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.dropdown}>
            <Text>Select Category</Text>
            <Ionicons name="chevron-down" size={18} />
          </View>

          <Text style={styles.label}>EXPIRY DATE</Text>
          <View style={styles.dropdown}>
            <Text>mm/dd/yyyy</Text>
            <Ionicons name="calendar-outline" size={18} />
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={styles.saveBtn}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveText}> Save Product</Text>
          </TouchableOpacity>

          {/* CANCEL */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel Entry</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#064e3b",
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 15,
  },

  subtitle: {
    color: "#64748b",
    marginTop: 5,
  },

  ocrCard: {
    backgroundColor: "#064e3b",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },

  ocrTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  ocrText: {
    color: "#d1fae5",
    marginTop: 5,
  },

  ocrBtn: {
    marginTop: 15,
  },

  ocrBtnText: {
    color: "#a7f3d0",
    fontWeight: "bold",
  },

  queueBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },

  queueLabel: {
    fontSize: 12,
    color: "#64748b",
  },

  queueText: {
    fontWeight: "bold",
  },

  tipBox: {
    backgroundColor: "#e2e8f0",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },

  tipTitle: {
    fontWeight: "bold",
  },

  tipText: {
    color: "#475569",
    marginTop: 5,
  },

  form: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },

  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 10,
  },

  input: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },

  saveBtn: {
    backgroundColor: "#064e3b",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#64748b",
  },
});