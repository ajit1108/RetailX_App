import React from "react";

import AppNavigator from "./src/navigation/AppNavigator";
import {
  PaperProvider,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";
import AppIcon from "./src/components/AppIcon";
import { palette } from "./src/theme/appTheme";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    secondary: palette.accent,
    background: palette.background,
    surface: palette.surface,
    onSurface: palette.text,
    onSurfaceVariant: palette.subtext,
    outline: palette.border,
  },
};

const paperSettings = {
  icon: (props: any) => <AppIcon {...props} />,
};

export default function App() {
  return (
    <PaperProvider theme={theme} settings={paperSettings}>
      <AppNavigator />
    </PaperProvider>
  );
}
