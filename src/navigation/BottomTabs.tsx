import React, { useCallback, useMemo, useState } from "react";
import { BottomNavigation } from "react-native-paper";
import { StyleSheet } from "react-native";

import Home from "../screens/Home";
import Inventory from "../screens/Inventory";
import Billing from "../screens/Billing";
import Analytics from "../screens/Analytics";
import { palette, shadow } from "../theme/appTheme";

export default function BottomTabs({ navigation }: any) {
  const [index, setIndex] = useState(0);

  const routes = useMemo(
    () => [
      {
        key: "home",
        title: "Home",
        focusedIcon: "home-outline",
        unfocusedIcon: "home-outline",
      },
      {
        key: "inventory",
        title: "Inventory",
        focusedIcon: "cube-outline",
        unfocusedIcon: "cube-outline",
      },
      {
        key: "billing",
        title: "Billing",
        focusedIcon: "receipt-outline",
        unfocusedIcon: "receipt-outline",
      },
      {
        key: "analytics",
        title: "Analytics",
        focusedIcon: "bar-chart-outline",
        unfocusedIcon: "bar-chart-outline",
      },
    ],
    []
  );

  const renderScene = useCallback(
    ({ route }: any) => {
      switch (route.key) {
        case "home":
          return <Home navigation={navigation} />;
        case "inventory":
          return <Inventory navigation={navigation} />;
        case "billing":
          return <Billing navigation={navigation} />;
        case "analytics":
          return <Analytics navigation={navigation} />;
        default:
          return null;
      }
    },
    [navigation]
  );

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      shifting={false}
      sceneAnimationEnabled
      activeColor={palette.primary}
      inactiveColor="#94a3b8"
      barStyle={styles.bar}
      labeled={true}
      compact={false}
      activeIndicatorStyle={{ backgroundColor: palette.primaryLight }}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    height: 72,
    ...shadow,
  },
});
