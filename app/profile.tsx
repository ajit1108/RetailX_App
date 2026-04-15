import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("Anagha");
  const [shop, setShop] = useState("RetailX Store");
  const [mobile, setMobile] = useState("9876543210");
  const [email, setEmail] = useState("test@gmail.com");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}>Profile</Text>

      {/* FIELDS */}
      <TextInput
        style={[styles.input, !editing && styles.disabled]}
        value={name}
        editable={editing}
        onChangeText={setName}
        placeholder="Full Name"
      />

      <TextInput
        style={[styles.input, !editing && styles.disabled]}
        value={shop}
        editable={editing}
        onChangeText={setShop}
        placeholder="Shop Name"
      />

      <TextInput
        style={[styles.input, !editing && styles.disabled]}
        value={mobile}
        editable={editing}
        onChangeText={setMobile}
        placeholder="Mobile Number"
      />

      <TextInput
        style={[styles.input, !editing && styles.disabled]}
        value={email}
        editable={editing}
        onChangeText={setEmail}
        placeholder="Email"
      />

      {/* EDIT / SAVE */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setEditing(!editing)}
      >
        <Text style={styles.buttonText}>
          {editing ? "Save Changes" : "Edit Profile"}
        </Text>
      </TouchableOpacity>

      {/* CHANGE PASSWORD */}
      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.logout}
  onPress={() => router.replace("/auth")}
>
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8fafc",
    flexGrow: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  disabled: {
    backgroundColor: "#e2e8f0", // grey when not editable
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  secondaryButton: {
    marginTop: 15,
    alignItems: "center",
  },

  secondaryText: {
    color: "#22c55e",
    fontWeight: "500",
  },
  logout: {
  marginTop: 30,
  backgroundColor: "#ef4444",
  padding: 14,
  borderRadius: 10,
  alignItems: "center",
},

logoutText: {
  color: "#fff",
  fontWeight: "bold",
},
});