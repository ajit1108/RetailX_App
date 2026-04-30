import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Chip, FAB, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import Header from "../components/Header";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

const categories = ["All", "Dairy", "Bakery", "Fruits"];

export default function Inventory({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any>("/api/products")
      .then((response) => {
        const grouped = response.productsByCategory || {};
        const flattened = Object.values(grouped)
          .flat()
          .map((product: any) => ({
            id: product._id || product.id,
            name: product.name,
            stock: product.quantity || 0,
            category: product.category || "Uncategorized",
            price: `Rs ${product.price || 0}`,
            expiry: product.expiryDate,
          }));

        if (flattened.length > 0) {
          setItems(flattened);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [items, query, selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <FadeInView>
            <Header navigation={navigation} />

            <View style={styles.heroCard}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>INVENTORY OVERVIEW</Text>
                <Text style={styles.heroTitle}>Track fast-moving stock clearly</Text>
                <Text style={styles.heroText}>
                  Search products, filter by category, and open detailed item
                  views with fewer taps.
                </Text>
              </View>
              <View style={styles.heroIcon}>
                <Ionicons name="cube-outline" size={24} color={palette.white} />
              </View>
            </View>

            <Text style={styles.title}>Inventory</Text>

            <TextInput
              mode="outlined"
              placeholder="Search products"
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              outlineColor={palette.border}
              activeOutlineColor={palette.primary}
              left={<TextInput.Icon icon="magnify" />}
            />

            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  selected={selectedCategory === cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.chip,
                    selectedCategory === cat ? styles.activeChip : null,
                  ]}
                  textStyle={[
                    styles.chipLabel,
                    selectedCategory === cat ? styles.activeChipLabel : null,
                  ]}
                >
                  {cat}
                </Chip>
              ))}
            </View>
          </FadeInView>
        }
        renderItem={({ item, index }) => {
          const lowStock = item.stock < 5;
          const productIconStyle = lowStock
            ? styles.productIconLow
            : styles.productIconDefault;
          const badgeStyle = lowStock ? styles.stockBadgeLow : styles.stockBadgeHealthy;
          const badgeTextStyle = lowStock
            ? styles.stockBadgeTextLow
            : styles.stockBadgeTextHealthy;

          return (
            <FadeInView delay={index * 40}>
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={[styles.productIcon, productIconStyle]}>
                    <Ionicons
                      name={lowStock ? "alert-circle-outline" : "basket-outline"}
                      size={20}
                      color={lowStock ? palette.danger : palette.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subText}>
                      {item.category} . {item.price}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightBox}>
                  <View style={[styles.stockBadge, badgeStyle]}>
                    <Text style={[styles.stockBadgeText, badgeTextStyle]}>
                      {lowStock ? `Low: ${item.stock}` : `In stock: ${item.stock}`}
                    </Text>
                  </View>

                  <ScalePressable
                    onPress={() => {
                      setSelectedItem(item);
                      setDialogVisible(true);
                    }}
                    style={styles.moreWrap}
                  >
                    <View style={styles.moreButton}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color={palette.primaryDark}
                      />
                    </View>
                  </ScalePressable>
                </View>
              </View>
            </FadeInView>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={palette.primary} />
              <Text style={styles.emptyText}>Loading inventory...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Add stock to start tracking inventory here.</Text>
            </View>
          )
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("AddProduct")}
        color={palette.white}
      />

      <Modal
        visible={dialogVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScalePressable
            style={styles.overlayButton}
            onPress={() => setDialogVisible(false)}
          >
            <View style={styles.overlayFill} />
          </ScalePressable>

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.dialogTitle}>{selectedItem?.name}</Text>

            <View style={styles.dialogBox}>
              <Text style={styles.dialogText}>Stock: {selectedItem?.stock}</Text>
              <Text style={styles.dialogText}>Category: {selectedItem?.category}</Text>
              <Text style={styles.dialogText}>Price: {selectedItem?.price}</Text>
            </View>

            <View style={styles.dialogActions}>
              <ScalePressable
                style={styles.sheetActionWrap}
                onPress={() => {
                  setDialogVisible(false);
                  navigation.navigate("ProductDetails", {
                    name: selectedItem?.name,
                    quantity: String(selectedItem?.stock ?? ""),
                    price: selectedItem?.price ?? "",
                    category: selectedItem?.category,
                    expiry: "12/12/2026",
                  });
                }}
              >
                <View style={styles.primarySheetAction}>
                  <Ionicons name="eye-outline" size={18} color={palette.white} />
                  <Text style={styles.primarySheetActionText}>View Details</Text>
                </View>
              </ScalePressable>

              <ScalePressable
                style={styles.sheetActionWrap}
                onPress={() => setDialogVisible(false)}
              >
                <View style={styles.secondarySheetAction}>
                  <Ionicons name="trash-outline" size={18} color={palette.danger} />
                  <Text style={styles.secondarySheetActionText}>Close</Text>
                </View>
              </ScalePressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    ...shadow,
  },
  heroCopy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  heroEyebrow: {
    color: "#99f6e4",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  heroText: {
    color: "#d1fae5",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: palette.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: palette.surface,
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: "#ecfeff",
    borderColor: "#cbd5e1",
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipLabel: {
    color: palette.primaryDark,
    fontWeight: "600",
  },
  activeChipLabel: {
    color: palette.white,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadow,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  productIconDefault: {
    backgroundColor: palette.surfaceMuted,
  },
  productIconLow: {
    backgroundColor: "#fee2e2",
  },
  name: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  subText: {
    color: palette.subtext,
    marginTop: 3,
  },
  rightBox: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  stockBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stockBadgeHealthy: {
    backgroundColor: "#dcfce7",
  },
  stockBadgeLow: {
    backgroundColor: "#fee2e2",
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stockBadgeTextHealthy: {
    color: palette.success,
  },
  stockBadgeTextLow: {
    color: palette.danger,
  },
  moreWrap: {
    borderRadius: radii.pill,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceMuted,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: palette.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.32)",
  },
  overlayButton: {
    flex: 1,
  },
  overlayFill: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: spacing.lg,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  dialogTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  dialogBox: {
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  dialogText: {
    color: palette.primaryDark,
    marginBottom: 4,
  },
  dialogActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: palette.subtext,
    textAlign: "center",
  },
  sheetActionWrap: {
    flex: 1,
    borderRadius: radii.md,
  },
  primarySheetAction: {
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  primarySheetActionText: {
    color: palette.white,
    fontWeight: "700",
  },
  secondarySheetAction: {
    backgroundColor: "#fef2f2",
    borderRadius: radii.md,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  secondarySheetActionText: {
    color: palette.danger,
    fontWeight: "700",
  },
});
