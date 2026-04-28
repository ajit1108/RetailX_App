import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Splash from "../screens/Splash";
import Auth from "../screens/Auth";
import BottomTabs from "./BottomTabs";
import AddProduct from "../screens/AddProduct";
import ProductDetails from "../screens/ProductDetails";
import Profile from "../screens/Profile";
import Notifications from "../screens/Notifications";
import Settings from "../screens/Settings";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  BottomTabs: undefined;
  AddProduct: undefined;
  ProductDetails: any;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="BottomTabs" component={BottomTabs} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
