import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Index() {
  const cartBounce = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    // Cart running bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(cartBounce, {
          toValue: -5,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(cartBounce, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ])
    ).start();
    setTimeout(() => {
  router.replace("/auth");
}, 2000);
  }, []);

  return (
    <View style={styles.container}>
      {/* CART */}
      <Animated.View
        style={{ transform: [{ translateY: cartBounce }] }}
      >
        <Ionicons name="cart" size={75} color="#22c55e" />
      </Animated.View>

      {/* TITLE */}
      <Text style={styles.title}>
        retail<Text style={{ color: "#22c55e" }}>x</Text>
      </Text>

      {/* MESSAGE */}
      <Text style={styles.subtitle}>
        Preparing your groceries
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02061a",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#94a3b8",
  },
});