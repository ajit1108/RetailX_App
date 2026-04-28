import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Snackbar, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import BarcodeScannerModal from "../components/BarcodeScannerModal";
import FadeInView from "../components/FadeInView";
import Header from "../components/Header";
import { mockCatalog, type CatalogProduct } from "../data/mockCatalog";
import { apiRequest } from "../services/apiClient";
import { palette, radii, shadow, spacing } from "../theme/appTheme";
import {
  ensureCameraPermission,
  showCameraPermissionAlert,
} from "../utils/cameraPermissions";

type BillItem = CatalogProduct & {
  qty: number;
};

const categories = [
  { name: "Milk", icon: "cafe-outline" },
  { name: "Bread", icon: "fast-food-outline" },
  { name: "Fruits", icon: "nutrition-outline" },
  { name: "Dairy", icon: "water-outline" },
];

const initialBillItems: BillItem[] = [
  { ...mockCatalog[0], qty: 2 },
  { ...mockCatalog[1], qty: 1 },
  { ...mockCatalog[2], qty: 1 },
];

export default function Billing({ navigation }: any) {
  const [qty, setQty] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [billItems, setBillItems] = useState<BillItem[]>(initialBillItems);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const sanitizeBarcode = (value: string) => value.replace(/\D/g, "").trim();
  const sanitizeSearchText = (value: string) =>
    String(value || "").trim().replace(/[^\w\s./:-]/g, " ");
  const isValidBarcode = (value: string) => /^\d{8,13}$/.test(value);

  const subtotal = useMemo(
    () => billItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [billItems]
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const addProductToBill = (product: CatalogProduct, quantity = 1) => {
    setBillItems((current) => {
      const existing = current.find((item) => item.barcode === product.barcode);
      if (existing) {
        return current.map((item) =>
          item.barcode === product.barcode
            ? { ...item, qty: item.qty + quantity }
            : item
        );
      }

      return [...current, { ...product, qty: quantity }];
    });
  };

  const removeProductFromBill = (barcode: string) => {
    setBillItems((current) => current.filter((item) => item.barcode !== barcode));
  };

  const handleScanBarcode = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) {
      showCameraPermissionAlert();
      return;
    }

    setScannerVisible(true);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setScannerVisible(false);
    const normalizedBarcode = sanitizeBarcode(barcode);
    console.log("Billing scanned barcode:", barcode);
    console.log("Billing normalized barcode:", normalizedBarcode);

    if (!isValidBarcode(normalizedBarcode)) {
      setSnackbarMessage("Invalid barcode scanned. Please try again.");
      return;
    }

    try {
      const query = sanitizeBarcode(normalizedBarcode);
      console.log("Billing outgoing scan query:", query);
      const response = await apiRequest<any>("/api/scan", {
        method: "POST",
        body: { query },
      });
      console.log("Billing scan API response:", response);

      if (response.found && response.product) {
        addProductToBill({
          id: response.product._id,
          barcode: response.product.barcode,
          name: response.product.name,
          price: response.product.price,
          category: response.product.category,
        });
        setSnackbarMessage(`${response.product.name} added to the bill.`);
        return;
      }
    } catch (error) {
      console.log("Billing scan API error:", error);
      // Keep local catalog fallback available when the backend is unreachable.
    }

    const product = mockCatalog.find((item) => item.barcode === normalizedBarcode);
    if (!product) {
      setSnackbarMessage(`Barcode ${normalizedBarcode} was not found in the local catalog.`);
      return;
    }

    addProductToBill(product);
    setSnackbarMessage(`${product.name} added to the bill.`);
  };

  const handleAddManualItem = () => {
    const quantity = Math.max(Number(qty) || 1, 1);
    const query = sanitizeSearchText(searchQuery);
    console.log("Billing outgoing manual search query:", query);

    apiRequest<any>("/api/scan", {
      method: "POST",
      body: { query },
    })
      .then((response) => {
        console.log("Billing manual search API response:", response);

        if (response.found && response.product) {
          addProductToBill(
            {
              id: response.product._id,
              barcode: response.product.barcode,
              name: response.product.name,
              price: response.product.price,
              category: response.product.category,
            },
            quantity
          );
          setSnackbarMessage(`${response.product.name} added manually.`);
          return;
        }

        const trimmedQuery = query.toLowerCase();
        const selectedProduct = mockCatalog.find((item) =>
          item.name.toLowerCase().includes(trimmedQuery)
        );

        if (!selectedProduct) {
          setSnackbarMessage("No matching product found for manual add.");
          return;
        }

        addProductToBill(selectedProduct, quantity);
        setSnackbarMessage(`${selectedProduct.name} added manually.`);
      })
      .catch((error) => {
        console.log("Billing manual search API error:", error);
        const trimmedQuery = query.toLowerCase();
        const selectedProduct = mockCatalog.find((item) =>
          item.name.toLowerCase().includes(trimmedQuery)
        );

        if (!selectedProduct) {
          setSnackbarMessage("No matching product found for manual add.");
          return;
        }

        addProductToBill(selectedProduct, quantity);
        setSnackbarMessage(`${selectedProduct.name} added manually.`);
      });
  };

  const handleGenerateBill = async () => {
    if (billItems.length === 0) {
      setSnackbarMessage("Add at least one product before generating the bill.");
      return;
    }

    try {
      const requestBody = {
        taxRate: 0.05,
        items: billItems.map((item) => ({
          barcode: sanitizeBarcode(item.barcode),
          name: item.name.trim(),
          price: item.price,
          quantity: item.qty,
        })),
      };
      console.log("Billing create bill request:", requestBody);
      await apiRequest<any>("/api/bills", {
        method: "POST",
        body: requestBody,
      });
      setSnackbarMessage("Bill generated successfully.");
    } catch (error) {
      console.log("Billing create bill error:", error);
      setSnackbarMessage(
        error instanceof Error ? error.message : "Unable to generate bill."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <Header navigation={navigation} notificationCount={3} />

          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>BILLING DESK</Text>
              <Text style={styles.heroTitle}>Scan barcodes and build bills faster</Text>
              <Text style={styles.heroText}>
                Barcode scanning adds known products directly to the bill and falls
                back safely when the code is missing from the catalog.
              </Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="receipt-outline" size={24} color={palette.white} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Scan or add items</Text>

          <Card style={styles.ocrCard}>
            <Card.Content style={styles.ocrContent}>
              <View style={styles.scanIcon}>
                <Ionicons name="barcode-outline" size={26} color={palette.white} />
              </View>
              <Text style={styles.ocrTitle}>Scan barcode</Text>
              <Text style={styles.ocrText}>
                Open the camera, align the barcode inside the frame, and add items
                straight to the bill.
              </Text>
              <Button
                mode="contained"
                buttonColor={palette.white}
                textColor={palette.primaryDark}
                style={styles.scanBtn}
                icon="barcode-scan"
                onPress={handleScanBarcode}
              >
                Scan Barcode
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Manual Entry</Text>

              <TextInput
                mode="outlined"
                placeholder="Search product"
                value={searchQuery}
                onChangeText={setSearchQuery}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
                style={styles.input}
                left={<TextInput.Icon icon="magnify" />}
              />

              <TextInput
                mode="outlined"
                label="Quantity"
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
                style={styles.input}
                left={<TextInput.Icon icon="numeric" />}
              />

              <Button
                mode="contained"
                buttonColor={palette.primary}
                textColor={palette.white}
                style={styles.addBtn}
                icon="cart-plus"
                onPress={handleAddManualItem}
              >
                Add to Bill
              </Button>
            </Card.Content>
          </Card>

          <Text style={styles.sectionTitle}>Quick Categories</Text>
          <View style={styles.grid}>
            {categories.map((category) => (
              <Card key={category.name} style={styles.gridItem}>
                <Card.Content style={styles.gridItemContent}>
                  <View style={styles.gridIcon}>
                    <Ionicons
                      name={category.icon as any}
                      size={22}
                      color={palette.primaryDark}
                    />
                  </View>
                  <Text style={styles.categoryText}>{category.name}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          <Card style={styles.billCard}>
            <Card.Content>
              <View style={styles.billHeader}>
                <View>
                  <Text style={styles.billTitle}>Current Bill</Text>
                  <Text style={styles.billMeta}>TXN-99812</Text>
                </View>
                <View style={styles.billBadge}>
                  <Ionicons name="flash-outline" size={16} color={palette.white} />
                  <Text style={styles.billBadgeText}>Active</Text>
                </View>
              </View>

              <FlatList
                data={billItems}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>
                        Qty {item.qty} . Rs {item.price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      <Text style={styles.itemPrice}>
                        Rs {(item.price * item.qty).toFixed(2)}
                      </Text>
                      <Button
                        compact
                        mode="text"
                        textColor={palette.white}
                        onPress={() => removeProductFromBill(item.barcode)}
                      >
                        Remove
                      </Button>
                    </View>
                  </View>
                )}
              />

              <View style={styles.totalsRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>Rs {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalLabel}>Tax (5%)</Text>
                <Text style={styles.totalValue}>Rs {tax.toFixed(2)}</Text>
              </View>
              <View style={styles.totalHighlight}>
                <Text style={styles.totalHighlightLabel}>Grand Total</Text>
                <Text style={styles.totalHighlightValue}>Rs {total.toFixed(2)}</Text>
              </View>

              <Button
                mode="contained"
                buttonColor={palette.white}
                textColor={palette.primaryDark}
                style={styles.generateBtn}
                icon="receipt-text-check-outline"
                onPress={handleGenerateBill}
              >
                Generate Bill
              </Button>
            </Card.Content>
          </Card>
        </FadeInView>
      </ScrollView>

      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={handleBarcodeDetected}
      />

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage("")}
        duration={2200}
      >
        {snackbarMessage}
      </Snackbar>
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
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  ocrCard: {
    borderRadius: radii.lg,
    backgroundColor: palette.primary,
    marginBottom: spacing.md,
    ...shadow,
  },
  ocrContent: {
    alignItems: "center",
  },
  scanIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  ocrTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: "700",
  },
  ocrText: {
    color: "#d1fae5",
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  scanBtn: {
    marginTop: spacing.md,
    borderRadius: radii.md,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: palette.surface,
    marginBottom: spacing.sm,
  },
  addBtn: {
    marginTop: spacing.xs,
    borderRadius: radii.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  gridItem: {
    width: "48%",
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    ...shadow,
  },
  gridItemContent: {
    alignItems: "center",
    gap: spacing.sm,
  },
  gridIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    color: palette.primaryDark,
    fontWeight: "700",
  },
  billCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radii.lg,
    ...shadow,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  billTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: "700",
  },
  billMeta: {
    color: "#d1fae5",
    marginTop: 3,
  },
  billBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  billBadgeText: {
    color: palette.white,
    fontWeight: "700",
    fontSize: 12,
  },
  item: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    color: palette.white,
    fontWeight: "700",
    maxWidth: 220,
  },
  itemQty: {
    color: "#d1fae5",
    marginTop: 4,
  },
  itemPrice: {
    color: palette.white,
    fontWeight: "700",
  },
  itemActions: {
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  totalLabel: {
    color: "#d1fae5",
  },
  totalValue: {
    color: palette.white,
    fontWeight: "600",
  },
  totalHighlight: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  totalHighlightLabel: {
    color: palette.white,
    fontWeight: "700",
  },
  totalHighlightValue: {
    color: palette.white,
    fontSize: 22,
    fontWeight: "700",
  },
  generateBtn: {
    marginTop: spacing.md,
    borderRadius: radii.md,
  },
});
