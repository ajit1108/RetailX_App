import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

export default function Auth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {isLogin ? "Welcome Back !" : "Create Account "}
        </Text>

        {/* SIGN UP FIELDS */}
        {!isLogin && (
          <>
            <TextInput placeholder="Full Name" style={styles.input} />
            <TextInput placeholder="Shop Name" style={styles.input} />
            <TextInput
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </>
        )}

        {/* COMMON FIELDS */}
        <TextInput placeholder="Email" style={styles.input} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        {/* BUTTON */}
        <TouchableOpacity style={styles.button}   onPress={() => router.replace("/tabs")}>
          <Text style={styles.buttonText }>
            {isLogin ? "Sign In" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* TOGGLE */}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggle}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#0f172a",
    textAlign: "center",
  },

  input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#00200f",
  },

  button: {
    backgroundColor: "#3b4d41",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  toggle: {
    marginTop: 20,
    textAlign: "center",
    color: "#0d652d",
    fontWeight: "500",
  },
});