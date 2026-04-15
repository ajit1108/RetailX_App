import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";

const categories = ["All", "Dairy", "Bakery", "Fruits"];

const data = [
  { id: "1", name: "Milk", stock: 2, category: "Dairy" },
  { id: "2", name: "Bread", stock: 15, category: "Bakery" },
  { id: "3", name: "Apple", stock: 30, category: "Fruits" },
  { id: "4", name: "Butter", stock: 5, category: "Dairy" },
];

export default function Inventory() {
  const router = useRouter() as any;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredData =
    selectedCategory === "All"
      ? data
      : data.filter((item) => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View style={styles.header}>
              
              <Text style={styles.logo}>RetailX</Text>
              <Ionicons name="notifications-outline" size={22} />
            </View>

            {/* TITLE ROW */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>Inventory</Text>
              <Ionicons name="cube-outline" size={24} />
            </View>

            {/* SEARCH */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#64748b" />
              <TextInput placeholder="Search products..." style={styles.input} />
            </View>

            {/* CATEGORY */}
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    selectedCategory === cat && styles.activeCategory,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={{
                      color: selectedCategory === cat ? "#fff" : "#000",
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* spacing fix (IMPORTANT) */}
            <View style={{ height: 10 }} />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.product}>{item.name}</Text>
              <Text style={styles.stock}>Stock: {item.stock}</Text>
            </View>

            <View style={styles.rightBox}>
              <Text
                style={{
                  color: item.stock < 5 ? "#ef4444" : "#22c55e",
                  fontWeight: "bold",
                }}
              >
                {item.stock < 5 ? "Low" : "Good"}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSelectedItem(item);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="ellipsis-vertical" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FLOAT BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-product")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              {selectedItem?.name}
            </Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                if (!selectedItem) return;

                setModalVisible(false);

                router.push({
                  pathname: "/product-details",
                  params: {
                    name: selectedItem.name,
                    quantity: String(selectedItem.stock),
                    price: "50",
                    category: selectedItem.category,
                    expiry: "12/12/2026",
                  },
                });
              }}
            >
              <Text>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn}>
              <Text style={{ color: "red" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 100,
    paddingTop: 5, // ✅ fixes Milk overlap issue
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    alignItems: "center",
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },

  titleRow: {
    marginTop: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
  },

  input: {
    flex: 1,
  },

  categoryRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
    marginBottom: 10, // ✅ important spacing fix
  },

  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
  },

  activeCategory: {
    backgroundColor: "#22c55e",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  product: {
    fontSize: 16,
    fontWeight: "bold",
  },

  stock: {
    color: "#64748b",
  },

  rightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#064e3b",
    padding: 15,
    borderRadius: 50,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 200,
  },

  modalBtn: {
    paddingVertical: 10,
  },
});