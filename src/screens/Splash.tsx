import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

import { palette } from "../theme/appTheme";

const splashLogo = require("../assets/retailx-splash-logo.png");

type Props = {
  navigation: any;
};

export default function Splash({ navigation }: Props) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const splashStartedAt = Date.now();
    let active = true;

    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const minimumSplashDelay = 900;
    const elapsed = Date.now() - splashStartedAt;
    const remainingDelay = Math.max(minimumSplashDelay - elapsed, 0);

    setTimeout(() => {
      if (!active) {
        return;
      }

      navigation.replace("Auth");
    }, remainingDelay);

    return () => {
      active = false;
    };
  }, [fade, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fadeWrap, { opacity: fade }]}>
        <Image source={splashLogo} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
  },
  fadeWrap: {
    alignItems: "center",
  },
  logo: {
    width: 320,
    height: 360,
    maxWidth: "82%",
    maxHeight: "60%",
  },
});
