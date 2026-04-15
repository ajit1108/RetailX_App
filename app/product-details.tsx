import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ SAFE PARAM EXTRACTION (NO TYPES, NO ERRORS)
  const nameParam = typeof params.name === "string" ? params.name : "";
  const quantityParam = typeof params.quantity === "string" ? params.quantity : "";
  const priceParam = typeof params.price === "string" ? params.price : "";
  const categoryParam = typeof params.category === "string" ? params.category : "";
  const expiryParam = typeof params.expiry === "string" ? params.expiry : "";

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(nameParam);
  const [quantity, setQuantity] = useState(quantityParam);
  const [price, setPrice] = useState(priceParam);
  const [category, setCategory] = useState(categoryParam);
  const [expiry, setExpiry] = useState(expiryParam);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      <View style={styles.container}>

        <Text style={styles.title}>Product Details</Text>

        {/* NAME */}
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          editable={isEditing}
          onChangeText={setName}
        />

        {/* QUANTITY */}
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          editable={isEditing}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        {/* PRICE */}
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          value={price}
          editable={isEditing}
          onChangeText={setPrice}
        />

        {/* CATEGORY */}
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          editable={isEditing}
          onChangeText={setCategory}
        />

        {/* EXPIRY */}
        <Text style={styles.label}>Expiry Date</Text>
        <TextInput
          style={styles.input}
          value={expiry}
          editable={isEditing}
          onChangeText={setExpiry}
        />

        {/* BUTTON */}
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              setIsEditing(false);
              router.back();
            }}
          >
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    marginTop: 10,
    color: "#64748b",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  editBtn: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },

  saveBtn: {
    backgroundColor: "#064e3b",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});