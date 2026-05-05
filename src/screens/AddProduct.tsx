import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Snackbar, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import BarcodeScannerModal from "../components/BarcodeScannerModal";
import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { mockCatalog } from "../data/mockCatalog";
import { apiRequest } from "../services/apiClient";
import { PRODUCT_SAVED_EVENT, emitAppEventWithPayload } from "../services/appEvents";
import { scanProductLabelFromCamera } from "../services/scannerService";
import { palette, radii, shadow, spacing } from "../theme/appTheme";
import {
  ensureCameraPermission,
  showCameraPermissionAlert,
} from "../utils/cameraPermissions";

export default function AddProduct({ navigation }: any) {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedExpiryDate, setSelectedExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [detectedText, setDetectedText] = useState("");
  const [barcode, setBarcode] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const sanitizeBarcode = (value: string) => value.replace(/\D/g, "").trim();
  const sanitizeSearchText = (value: string) =>
    String(value || "").trim().replace(/[^\w\s./:-]/g, " ");
  const isValidBarcode = (value: string) => /^\d{8,13}$/.test(value);
  const formatDateValue = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  const parseExpiryDate = (value: string) => {
    const trimmedValue = String(value || "").trim();

    if (!trimmedValue) {
      return null;
    }

    const slashMatch = trimmedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (slashMatch) {
      const [, dayText, monthText, yearText] = slashMatch;
      const year =
        yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
      const month = Number(monthText) - 1;
      const day = Number(dayText);
      const parsed = new Date(year, month, day);

      if (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month &&
        parsed.getDate() === day
      ) {
        return parsed;
      }
    }

    const parsed = new Date(trimmedValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const normalizeExpiryDate = (value: string) => {
    const parsed = parseExpiryDate(value);
    return parsed ? formatDateValue(parsed) : String(value || "").trim();
  };
  const openDatePicker = () => {
    const parsed = parseExpiryDate(expiryDate);
    setSelectedExpiryDate(parsed || new Date());
    setShowDatePicker(true);
  };
  const handleExpiryDateChange = (
    event: DateTimePickerEvent,
    nextDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed" || !nextDate) {
      return;
    }

    setSelectedExpiryDate(nextDate);
    setExpiryDate(formatDateValue(nextDate));
  };

  const handleScanText = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) {
      showCameraPermissionAlert();
      return;
    }

    try {
      setScanLoading(true);
      const result = await scanProductLabelFromCamera();

      if (result.cancelled) {
        return;
      }

      setDetectedText(result.rawText);

      if (result.parsed.barcode) {
        setBarcode(result.parsed.barcode);
      }

      if (result.parsed.name) {
        setProductName(result.parsed.name);
      }

      if (result.parsed.category) {
        setCategory(result.parsed.category);
      }

      if (result.parsed.price) {
        setPrice(result.parsed.price);
      }

      if (result.parsed.quantity) {
        setQuantity(result.parsed.quantity);
      }

      if (result.parsed.expiryDate) {
        const normalizedExpiryDate = normalizeExpiryDate(result.parsed.expiryDate);
        const parsedExpiryDate = parseExpiryDate(normalizedExpiryDate);
        setExpiryDate(normalizedExpiryDate);
        if (parsedExpiryDate) {
          setSelectedExpiryDate(parsedExpiryDate);
        }
      }

      if (
        !result.parsed.barcode &&
        !result.parsed.name &&
        !result.parsed.category &&
        !result.parsed.price &&
        !result.parsed.quantity &&
        !result.parsed.expiryDate
      ) {
        Alert.alert(
          "Scan Complete",
          "Text was detected, but we could not confidently extract the product fields. You can still edit the manual entry form."
        );
      }
    } catch (error) {
      Alert.alert(
        "Scan Failed",
        error instanceof Error
          ? error.message
          : "We could not read the product label."
      );
    } finally {
      setScanLoading(false);
    }
  };

  const handleOpenBarcodeScanner = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) {
      showCameraPermissionAlert();
      return;
    }

    setBarcodeScannerVisible(true);
  };

  const handleBarcodeDetected = async (scannedBarcode: string) => {
    setBarcodeScannerVisible(false);
    const normalizedBarcode = sanitizeBarcode(scannedBarcode);
    console.log("AddProduct scanned barcode:", scannedBarcode);
    console.log("AddProduct normalized barcode:", normalizedBarcode);

    if (!isValidBarcode(normalizedBarcode)) {
      setSnackbarMessage("Invalid barcode scanned. Please try again.");
      return;
    }

    setBarcode(normalizedBarcode);

    try {
      const query = sanitizeBarcode(normalizedBarcode);
      console.log("AddProduct outgoing scan query:", query);
      const response = await apiRequest<any>("/api/scan", {
        method: "POST",
        body: { query },
      });
      console.log("AddProduct scan API response:", response);

      if (response.found && response.product) {
        setProductName(response.product.name || "");
        setPrice(String(response.product.price || ""));
        setCategory(response.product.category || "");
        if (!quantity) {
          setQuantity("1");
        }
        setSnackbarMessage(`${response.product.name} details filled from barcode.`);
        return;
      }
    } catch (error) {
      console.log("AddProduct scan API error:", error);
      // Keep local catalog fallback available when the backend is unreachable.
    }

    const product = mockCatalog.find((item) => item.barcode === normalizedBarcode);
    if (!product) {
      setSnackbarMessage(`Barcode ${normalizedBarcode} was not found in the catalog.`);
      return;
    }

    setProductName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);
    if (!quantity) {
      setQuantity("1");
    }
    setSnackbarMessage(`${product.name} details filled from barcode.`);
  };

  const handleSaveProduct = async () => {
    const normalizedBarcode = sanitizeBarcode(barcode);

    if (!productName.trim() && !normalizedBarcode) {
      setSnackbarMessage("Add a product name or barcode before saving.");
      return;
    }

    if (normalizedBarcode && !isValidBarcode(normalizedBarcode)) {
      setSnackbarMessage("Barcode must contain 8 to 13 digits.");
      return;
    }

    try {
      const requestBody = {
        name: sanitizeSearchText(productName),
        barcode: normalizedBarcode,
        quantity: Number(quantity) || 0,
        price: Number(price) || 0,
        category: sanitizeSearchText(category),
        expiryDate: normalizeExpiryDate(expiryDate),
      };
      console.log("AddProduct save request:", requestBody);
      const response = await apiRequest<any>("/api/products", {
        method: "POST",
        body: requestBody,
      });
      emitAppEventWithPayload(PRODUCT_SAVED_EVENT, response.product);
      setSnackbarMessage("Product saved successfully.");
      navigation.goBack();
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "Unable to save product."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <View style={styles.header}>
            <ScalePressable onPress={() => navigation.goBack()} style={styles.iconWrap}>
              <View style={styles.iconButton}>
                <Ionicons name="arrow-back" size={20} color={palette.text} />
              </View>
            </ScalePressable>

            <Text style={styles.headerTitle}>Add Product</Text>

            <View style={styles.iconPlaceholder} />
          </View>

          <Card style={styles.heroCard}>
            <Card.Content style={styles.heroContent}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>NEW PRODUCT ENTRY</Text>
                <Text style={styles.heroTitle}>Scan a label or fill details manually</Text>
                <Text style={styles.heroText}>
                  OCR reads the captured label and auto-fills product name and price
                  when the text is visible.
                </Text>
              </View>
              <View style={styles.heroIcon}>
                <Ionicons name="scan-outline" size={24} color={palette.white} />
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.ocrCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Product Label OCR</Text>
              <Text style={styles.sectionText}>
                Capture a product label with the back camera to extract the name and
                price automatically.
              </Text>

              <Button
                mode="contained"
                buttonColor={palette.primary}
                textColor={palette.white}
                style={styles.primaryBtn}
                icon="text-box-search-outline"
                loading={scanLoading}
                disabled={scanLoading}
                onPress={handleScanText}
              >
                {scanLoading ? "Scanning..." : "Scan Text"}
              </Button>

              <Button
                mode="outlined"
                textColor={palette.primaryDark}
                style={styles.secondaryBtn}
                icon="barcode-scan"
                onPress={handleOpenBarcodeScanner}
              >
                Scan Barcode
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.infoRow}>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.infoLabel}>QUEUE STATUS</Text>
                <Text style={styles.infoValue}>0 Pending Uploads</Text>
              </Card.Content>
            </Card>

            <Card style={styles.tipCard}>
              <Card.Content>
                <Text style={styles.infoLabel}>OCR TIP</Text>
                <Text style={styles.tipText}>
                  Keep the label flat, bright, and close enough so the price line is readable.
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.formTitle}>Manual Entry</Text>

              <TextInput
                label="Product Name"
                mode="outlined"
                value={productName}
                onChangeText={setProductName}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                label="Barcode"
                mode="outlined"
                value={barcode}
                onChangeText={(value) => setBarcode(sanitizeBarcode(value))}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
                keyboardType="number-pad"
              />
              <View style={styles.row}>
                <TextInput
                  label="Quantity"
                  mode="outlined"
                  value={quantity}
                  onChangeText={setQuantity}
                  style={[styles.input, styles.halfInput]}
                  outlineColor={palette.border}
                  activeOutlineColor={palette.primary}
                  keyboardType="numeric"
                />
                <TextInput
                  label="Price"
                  mode="outlined"
                  value={price}
                  onChangeText={setPrice}
                  style={[styles.input, styles.halfInput]}
                  outlineColor={palette.border}
                  activeOutlineColor={palette.primary}
                  keyboardType="numeric"
                />
              </View>
              <TextInput
                label="Category"
                mode="outlined"
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                label="Expiry Date"
                mode="outlined"
                value={expiryDate}
                placeholder="YYYY-MM-DD"
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
                showSoftInputOnFocus={false}
                onFocus={openDatePicker}
                onPressIn={openDatePicker}
                right={
                  <TextInput.Icon
                    icon="calendar-month-outline"
                    onPress={openDatePicker}
                  />
                }
              />

              {showDatePicker ? (
                <DateTimePicker
                  value={selectedExpiryDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={handleExpiryDateChange}
                />
              ) : null}

              {detectedText ? (
                <View style={styles.detectedCard}>
                  <Text style={styles.detectedTitle}>Detected text</Text>
                  <Text style={styles.detectedBody}>{detectedText}</Text>
                </View>
              ) : null}

              <Button
                mode="contained"
                style={styles.primaryBtn}
                buttonColor={palette.primary}
                textColor={palette.white}
                icon="content-save-outline"
                onPress={handleSaveProduct}
              >
                Save Product
              </Button>

              <Button
                mode="text"
                textColor={palette.primaryDark}
                onPress={() => navigation.goBack()}
              >
                Cancel Entry
              </Button>
            </Card.Content>
          </Card>
        </FadeInView>
      </ScrollView>

      <BarcodeScannerModal
        visible={barcodeScannerVisible}
        onClose={() => setBarcodeScannerVisible(false)}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
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
  iconPlaceholder: {
    width: 42,
  },
  heroCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  ocrCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionText: {
    color: palette.subtext,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: spacing.md,
    borderRadius: radii.md,
  },
  secondaryBtn: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
    borderColor: palette.border,
  },
  infoRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    ...shadow,
  },
  tipCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
  },
  infoLabel: {
    color: palette.subtext,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  infoValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  tipText: {
    color: palette.primaryDark,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    ...shadow,
  },
  formTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: palette.surface,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  detectedCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  detectedTitle: {
    color: palette.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  detectedBody: {
    color: palette.primaryDark,
    lineHeight: 20,
  },
});
