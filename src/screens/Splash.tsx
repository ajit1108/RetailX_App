import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { palette } from "../theme/appTheme";

type Props = {
  navigation: any;
};

export default function Splash({ navigation }: Props) {
  const cartBounce = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(cartBounce, {
          toValue: -8,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cartBounce, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    animation.start();

    const timer = setTimeout(() => {
      navigation.replace("Auth");
    }, 1800);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [cartBounce, fade, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fadeWrap, { opacity: fade }]}>
        <Animated.View style={[styles.iconWrap, { transform: [{ translateY: cartBounce }] }]}>
          <Ionicons name="cart-outline" size={64} color={palette.white} />
        </Animated.View>

        <Text style={styles.title}>retailX</Text>
        <Text style={styles.subtitle}>Preparing your store dashboard</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  fadeWrap: {
    alignItems: "center",
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: palette.white,
    marginTop: 22,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#cbd5e1",
  },
});
