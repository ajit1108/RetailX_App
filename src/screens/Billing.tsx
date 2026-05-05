import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Card, Snackbar, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import BarcodeScannerModal from "../components/BarcodeScannerModal";
import FadeInView from "../components/FadeInView";
import Header from "../components/Header";
import { apiRequest } from "../services/apiClient";
import { BILL_CREATED_EVENT, emitAppEvent } from "../services/appEvents";
import { palette, radii, shadow, spacing } from "../theme/appTheme";
import {
  ensureCameraPermission,
  showCameraPermissionAlert,
} from "../utils/cameraPermissions";

type ProductSuggestion = {
  id: string;
  barcode: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
};

type BillItem = ProductSuggestion & {
  qty: number;
};

const categories = [
  { name: "Milk", icon: "cafe-outline" },
  { name: "Bread", icon: "fast-food-outline" },
  { name: "Fruits", icon: "nutrition-outline" },
  { name: "Dairy", icon: "water-outline" },
];

export default function Billing({ navigation }: any) {
  const [qty, setQty] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductSuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [submittingBill, setSubmittingBill] = useState(false);
  const [sharingOnWhatsApp, setSharingOnWhatsApp] = useState(false);
  const [lastBillLink, setLastBillLink] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const sanitizeBarcode = (value: string) => value.replace(/\D/g, "").trim();
  const sanitizeSearchText = (value: string) =>
    String(value || "").trim().replace(/[^\w\s./:-]/g, " ");
  const isValidBarcode = (value: string) => /^\d{8,13}$/.test(value);

  const loadCatalogProducts = useCallback(
    async ({ isRefreshing = false }: { isRefreshing?: boolean } = {}) => {
      if (isRefreshing) {
        setRefreshing(true);
      }

      await apiRequest<any>("/api/products", { cache: false })
        .then((response) => {
          const grouped = response.productsByCategory || {};
          const flattened = Object.values(grouped)
            .flat()
            .map((item: any) => ({
              id: item._id || item.id,
              barcode: item.barcode || "",
              name: item.name,
              price: Number(item.price || 0),
              category: item.category || "Uncategorized",
              quantity: Number(item.quantity || 0),
            }));

          setCatalogProducts(flattened);
        })
        .catch(() => {
          setCatalogProducts([]);
        })
        .finally(() => {
          if (isRefreshing) {
            setRefreshing(false);
          }
        });
    },
    []
  );

  useEffect(() => {
    loadCatalogProducts();
  }, [loadCatalogProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(sanitizeSearchText(searchQuery));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const query = debouncedQuery.trim();

    if (!query) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    const normalizedQuery = query.toLowerCase();
    const nextSuggestions = catalogProducts
      .filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
        const barcodeMatch =
          normalizedQuery.length > 0 && item.barcode.includes(normalizedQuery);

        return nameMatch || barcodeMatch;
      })
      .slice(0, 8);

    setSuggestions(nextSuggestions);
    setSearching(false);
  }, [catalogProducts, debouncedQuery]);

  const subtotal = useMemo(
    () => billItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [billItems]
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const addProductToBill = (product: ProductSuggestion, quantity = 1) => {
    setBillItems((current) => {
      const existing = current.find((item) =>
        item.barcode ? item.barcode === product.barcode : item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          (item.barcode && item.barcode === product.barcode) || item.id === product.id
            ? { ...item, qty: item.qty + quantity }
            : item
        );
      }

      return [...current, { ...product, qty: quantity }];
    });
  };

  const removeProductFromBill = (itemId: string) => {
    setBillItems((current) => current.filter((item) => item.id !== itemId));
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

    if (!isValidBarcode(normalizedBarcode)) {
      setSnackbarMessage("Invalid barcode scanned. Please try again.");
      return;
    }

    try {
      const response = await apiRequest<any>("/api/scan", {
        method: "POST",
        body: { query: normalizedBarcode },
      });

      if (!response.found || !response.product) {
        setSnackbarMessage("Product not found for this barcode.");
        return;
      }

      addProductToBill({
        id: response.product._id,
        barcode: response.product.barcode || "",
        name: response.product.name,
        price: Number(response.product.price || 0),
        category: response.product.category || "Uncategorized",
        quantity: Number(response.product.quantity || 0),
      });
      setSnackbarMessage(`${response.product.name} added to the bill.`);
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "Unable to look up this barcode."
      );
    }
  };

  const handleSelectSuggestion = (product: ProductSuggestion) => {
    const quantity = Math.max(Number(qty) || 1, 1);
    addProductToBill(product, quantity);
    setSearchQuery("");
    setSuggestions([]);
    setQty("1");
    setSnackbarMessage(`${product.name} added to the bill.`);
  };

  const handleAddManualItem = () => {
    const quantity = Math.max(Number(qty) || 1, 1);
    const selectedProduct = suggestions[0];

    if (!selectedProduct) {
      setSnackbarMessage("No matching product found for manual add.");
      return;
    }

    addProductToBill(selectedProduct, quantity);
    setSearchQuery("");
    setSuggestions([]);
    setQty("1");
    setSnackbarMessage(`${selectedProduct.name} added to the bill.`);
  };

  const handleGenerateBill = async () => {
    if (billItems.length === 0) {
      setSnackbarMessage("Add at least one product before generating the bill.");
      return;
    }

    try {
      setSubmittingBill(true);
      const requestBody = {
        taxRate: 0.05,
        items: billItems.map((item) => ({
          productId: item.id,
          barcode: sanitizeBarcode(item.barcode),
          name: item.name.trim(),
          price: item.price,
          quantity: item.qty,
        })),
      };

      const response = await apiRequest<any>("/api/bills", {
        method: "POST",
        body: requestBody,
      });

      emitAppEvent(BILL_CREATED_EVENT);
      setLastBillLink(String(response.pdfDownloadUrl || ""));
      setBillItems([]);
      setSearchQuery("");
      setSuggestions([]);
      setQty("1");
      setSnackbarMessage("Bill generated successfully.");
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "Unable to generate bill."
      );
    } finally {
      setSubmittingBill(false);
    }
  };

  const handleShareOnWhatsApp = async () => {
    if (!lastBillLink) {
      setSnackbarMessage("Generate a bill first to share it on WhatsApp.");
      return;
    }

    const message = encodeURIComponent(
      `RetailX bill is ready.\n\nView or download your invoice here:\n${lastBillLink}`
    );

    try {
      setSharingOnWhatsApp(true);
      await Linking.openURL(`https://wa.me/?text=${message}`);
    } catch {
      setSnackbarMessage("Unable to open WhatsApp.");
    } finally {
      setSharingOnWhatsApp(false);
    }
  };

  const shouldShowNoProducts =
    debouncedQuery.trim().length > 0 && !searching && suggestions.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCatalogProducts({ isRefreshing: true })}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <FadeInView>
          <Header navigation={navigation} />

          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>BILLING DESK</Text>
              <Text style={styles.heroTitle}>Scan barcodes and build bills faster</Text>
              <Text style={styles.heroText}>
                Search products instantly, keep the bill clean, and share receipts
                only when you choose to after checkout.
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

              {searching ? (
                <Text style={styles.helperText}>Searching products...</Text>
              ) : null}

              {!searching && suggestions.length > 0 ? (
                <View style={styles.suggestionList}>
                  {suggestions.map((item) => (
                    <Card
                      key={item.id}
                      style={styles.suggestionCard}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <Card.Content style={styles.suggestionContent}>
                        <View style={styles.suggestionCopy}>
                          <Text style={styles.suggestionTitle}>{item.name}</Text>
                          <Text style={styles.suggestionMeta}>
                            {item.category} . Rs {item.price.toFixed(2)}
                          </Text>
                        </View>
                        <Ionicons
                          name="add-circle-outline"
                          size={20}
                          color={palette.primary}
                        />
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              ) : null}

              {shouldShowNoProducts ? (
                <Text style={styles.helperText}>No products found</Text>
              ) : null}

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
                  <Text style={styles.billMeta}>
                    {billItems.length === 0
                      ? "Start by scanning or searching a product"
                      : `${billItems.length} item${billItems.length === 1 ? "" : "s"} added`}
                  </Text>
                </View>
                <View style={styles.billBadge}>
                  <Ionicons name="flash-outline" size={16} color={palette.white} />
                  <Text style={styles.billBadgeText}>
                    {billItems.length === 0 ? "Empty" : "Active"}
                  </Text>
                </View>
              </View>

              {billItems.length === 0 ? (
                <View style={styles.emptyBillState}>
                  <Ionicons
                    name="receipt-outline"
                    size={26}
                    color="rgba(255,255,255,0.75)"
                  />
                  <Text style={styles.emptyBillTitle}>Billing starts empty now</Text>
                  <Text style={styles.emptyBillText}>
                    Search or scan a product to build the current bill.
                  </Text>
                </View>
              ) : (
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
                          onPress={() => removeProductFromBill(item.id)}
                        >
                          Remove
                        </Button>
                      </View>
                    </View>
                  )}
                />
              )}

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
                loading={submittingBill}
                disabled={submittingBill}
              >
                {submittingBill ? "Generating Bill..." : "Generate Bill"}
              </Button>

              <Button
                mode="outlined"
                textColor={palette.white}
                style={styles.shareBtn}
                icon="whatsapp"
                onPress={handleShareOnWhatsApp}
                loading={sharingOnWhatsApp}
                disabled={sharingOnWhatsApp || !lastBillLink}
              >
                Send via WhatsApp
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
  helperText: {
    color: palette.subtext,
    marginBottom: spacing.sm,
  },
  suggestionList: {
    marginBottom: spacing.sm,
  },
  suggestionCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestionCopy: {
    flex: 1,
    marginRight: spacing.sm,
  },
  suggestionTitle: {
    color: palette.text,
    fontWeight: "700",
  },
  suggestionMeta: {
    color: palette.subtext,
    marginTop: 2,
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
  emptyBillState: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  emptyBillTitle: {
    color: palette.white,
    fontWeight: "700",
    fontSize: 16,
    marginTop: spacing.sm,
  },
  emptyBillText: {
    color: "#d1fae5",
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 18,
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
  shareBtn: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
    borderColor: "rgba(255,255,255,0.45)",
  },
});
