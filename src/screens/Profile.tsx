import React, { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
import { clearAuthSession } from "../services/authSession";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

export default function Profile({ navigation }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Anagha");
  const [shop, setShop] = useState("RetailX Store");
  const [mobile, setMobile] = useState("9876543210");
  const [email, setEmail] = useState("test@gmail.com");
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(
    async ({ isRefreshing = false }: { isRefreshing?: boolean } = {}) => {
      if (isRefreshing) {
        setRefreshing(true);
      }

      await apiRequest<any>("/api/users/me", { cache: false })
      .then((response) => {
        setName((current) => response.user?.name || current);
        setShop((current) => response.user?.shopName || current);
        setMobile((current) => response.user?.mobile || current);
        setEmail((current) => response.user?.email || current);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isRefreshing) {
          setRefreshing(false);
        }
      });
    },
    []
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }

    try {
      const response = await apiRequest<any>("/api/users/me", {
        method: "PUT",
        body: { name, shopName: shop, mobile, email },
      });
      setName(response.user?.name || name);
      setShop(response.user?.shopName || shop);
      setMobile(response.user?.mobile || mobile);
      setEmail(response.user?.email || email);
      setEditing(false);
    } catch (error) {
      Alert.alert(
        "Update Failed",
        error instanceof Error ? error.message : "Unable to update profile."
      );
    }
  };

  const handleLogout = async () => {
    await clearAuthSession();
    navigation.replace("Auth");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfile({ isRefreshing: true })}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <FadeInView>
          <View style={styles.header}>
            <ScalePressable onPress={() => navigation.goBack()} style={styles.iconWrap}>
              <View style={styles.iconButton}>
                <Ionicons name="arrow-back" size={20} color={palette.text} />
              </View>
            </ScalePressable>

            <Text style={styles.headerTitle}>Profile</Text>

            <ScalePressable onPress={() => navigation.navigate("Settings")} style={styles.iconWrap}>
              <View style={styles.iconButton}>
                <Ionicons name="settings-outline" size={20} color={palette.text} />
              </View>
            </ScalePressable>
          </View>

          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileTop}>
              <Avatar.Text size={68} label="A" style={styles.avatar} color={palette.white} />
              <View style={styles.profileMeta}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.shop}>{shop}</Text>
                <View style={styles.statusChip}>
                  <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                  <Text style={styles.statusText}>Store profile active</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Account Details</Text>

              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                editable={editing}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                label="Shop Name"
                value={shop}
                onChangeText={setShop}
                mode="outlined"
                editable={editing}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                label="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                mode="outlined"
                editable={editing}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                editable={editing}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />

              <Button
                mode="contained"
                style={styles.primaryBtn}
                buttonColor={palette.primary}
                textColor={palette.white}
                onPress={handleSaveProfile}
                icon={editing ? "content-save-outline" : "pencil-outline"}
              >
                {editing ? "Save Changes" : "Edit Profile"}
              </Button>

              <Button
                mode="text"
                textColor={palette.primaryDark}
                style={styles.secondaryBtn}
                icon="lock-outline"
              >
                Change Password
              </Button>

              <Button
                mode="outlined"
                textColor={palette.primaryDark}
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate("Settings")}
                icon="cog-outline"
              >
                Open Settings
              </Button>

              <Button
                mode="contained"
                buttonColor={palette.danger}
                textColor={palette.white}
                style={styles.logoutBtn}
                onPress={handleLogout}
                icon="logout"
              >
                Logout
              </Button>
            </Card.Content>
          </Card>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
  },
  iconWrap: {
    borderRadius: radii.pill,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  profileCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  profileMeta: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    color: palette.white,
    fontSize: 22,
    fontWeight: "700",
  },
  shop: {
    color: "#d1fae5",
    marginTop: 4,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: palette.white,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: spacing.sm,
  },
  statusText: {
    color: palette.primaryDark,
    fontWeight: "600",
    fontSize: 12,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    ...shadow,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: palette.surface,
  },
  primaryBtn: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
  },
  secondaryBtn: {
    marginTop: spacing.xs,
  },
  logoutBtn: {
    marginTop: spacing.md,
    borderRadius: radii.md,
  },
});
