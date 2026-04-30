import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
import { setAuthSession } from "../services/authSession";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

type Props = {
  navigation: any;
};

export default function Auth({ navigation }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      console.log("Auth request start:", isLogin ? "login" : "register");
      const path = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email, password }
        : { name, shopName, mobile, email, password };
      const response = await apiRequest<any>(path, {
        method: "POST",
        body,
        auth: false,
      });
      console.log("Auth request success:", path);

      setAuthSession(response.token, response.user);
      navigation.replace("BottomTabs");
    } catch (error) {
      console.log("Auth request error:", error);
      Alert.alert(
        "Authentication Failed",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <FadeInView style={styles.content}>
          <View style={styles.brandWrap}>
            <View style={styles.brandIcon}>
              <Ionicons name="storefront-outline" size={28} color={palette.white} />
            </View>
            <Text style={styles.brandText}>retailX</Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                {isLogin ? "Welcome back" : "Create your account"}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? "Sign in to manage inventory, billing, and smart store insights."
                  : "Start with your shop details and keep your counters organized."}
              </Text>

              {!isLogin ? (
                <>
                  <TextInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                    outlineColor={palette.border}
                    activeOutlineColor={palette.primary}
                  />
                  <TextInput
                    label="Shop Name"
                    value={shopName}
                    onChangeText={setShopName}
                    style={styles.input}
                    mode="outlined"
                    outlineColor={palette.border}
                    activeOutlineColor={palette.primary}
                  />
                  <TextInput
                    label="Mobile Number"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    style={styles.input}
                    mode="outlined"
                    outlineColor={palette.border}
                    activeOutlineColor={palette.primary}
                  />
                </>
              ) : null}

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                mode="outlined"
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
                left={<TextInput.Icon icon="email-outline" />}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
                left={<TextInput.Icon icon="lock-outline" />}
              />

              {isLogin ? (
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              ) : null}

              <ScalePressable
                disabled={loading}
                style={styles.primaryActionWrap}
                onPress={handleAuth}
              >
                <View style={styles.primaryAction}>
                  <Ionicons
                    name={isLogin ? "log-in-outline" : "person-add-outline"}
                    size={20}
                    color={palette.white}
                  />
                  <Text style={styles.primaryActionText}>
                    {loading ? "Signing in..." : isLogin ? "Sign In" : "Sign Up"}
                  </Text>
                </View>
              </ScalePressable>

              <Button
                mode="text"
                onPress={() => setIsLogin((current) => !current)}
                style={styles.switchButton}
                labelStyle={styles.switchLabel}
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Button>
            </Card.Content>
          </Card>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  content: {
    gap: spacing.md,
  },
  brandWrap: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  brandIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  brandText: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.text,
    marginTop: spacing.sm,
  },
  card: {
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    backgroundColor: palette.surface,
    ...shadow,
  },
  title: {
    textAlign: "center",
    color: palette.text,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: palette.subtext,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: palette.surface,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: palette.primaryDark,
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  primaryActionWrap: {
    borderRadius: radii.md,
    marginTop: spacing.xs,
  },
  primaryAction: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  primaryActionText: {
    color: palette.white,
    fontWeight: "700",
    fontSize: 15,
  },
  switchButton: {
    marginTop: spacing.sm,
  },
  switchLabel: {
    color: palette.primaryDark,
  },
});
