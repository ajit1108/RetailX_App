import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { apiRequest } from "../services/apiClient";
import { PRODUCT_SAVED_EVENT, emitAppEventWithPayload } from "../services/appEvents";
import { palette, radii, shadow, spacing } from "../theme/appTheme";

export default function ProductDetails({ route, navigation }: any) {
  const { productId, name, quantity, price, category, expiry } = route.params || {};

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productName, setProductName] = useState(name || "Organic Milk");
  const [productQty, setProductQty] = useState(String(quantity || "24"));
  const [productPrice, setProductPrice] = useState(
    String(price ?? "58").replace(/^Rs\s*/i, "")
  );
  const [productCategory, setProductCategory] = useState(category || "Dairy");
  const [productExpiry, setProductExpiry] = useState("");
  const [selectedExpiryDate, setSelectedExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  React.useEffect(() => {
    const parsedExpiry = parseExpiryDate(expiry || "");

    if (parsedExpiry) {
      setProductExpiry(formatDateValue(parsedExpiry));
      setSelectedExpiryDate(parsedExpiry);
      return;
    }

    setProductExpiry(String(expiry || "12/12/2026"));
  }, [expiry]);

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

  const normalizeNumberInput = (value: string) => {
    const parsedValue = Number(String(value || "").replace(/[^\d.]/g, ""));
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  };

  const openDatePicker = () => {
    const parsed = parseExpiryDate(productExpiry);
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
    setProductExpiry(formatDateValue(nextDate));
  };

  const handlePrimaryAction = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!productId) {
      setIsEditing(false);
      navigation.goBack();
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: productName.trim(),
        quantity: Math.max(normalizeNumberInput(productQty), 0),
        price: Math.max(normalizeNumberInput(productPrice), 0),
        category: productCategory.trim(),
        expiryDate: parseExpiryDate(productExpiry)
          ? formatDateValue(parseExpiryDate(productExpiry) as Date)
          : productExpiry.trim(),
      };

      const response = await apiRequest<any>(`/api/products/${productId}`, {
        method: "PUT",
        body: payload,
      });

      emitAppEventWithPayload(PRODUCT_SAVED_EVENT, response.product);
      setIsEditing(false);
      navigation.goBack();
    } catch {
      setIsEditing(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <View style={styles.header}>
            <ScalePressable onPress={() => navigation.goBack()} style={styles.iconWrap}>
              <View style={styles.iconButton}>
                <Ionicons name="arrow-back" size={20} color={palette.text} />
              </View>
            </ScalePressable>

            <Text style={styles.headerTitle}>Details</Text>

            <ScalePressable style={styles.iconWrap}>
              <View style={styles.iconButton}>
                <Ionicons name="create-outline" size={20} color={palette.text} />
              </View>
            </ScalePressable>
          </View>

          <Card style={styles.heroCard}>
            <Card.Content style={styles.heroContent}>
              <View>
                <Text style={styles.heroEyebrow}>PRODUCT RECORD</Text>
                <Text style={styles.heroTitle}>{productName}</Text>
                <Text style={styles.heroText}>
                  Review key information before editing this stock item.
                </Text>
              </View>
              <View style={styles.heroIcon}>
                <Ionicons name="cube-outline" size={24} color={palette.white} />
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Product Details</Text>

              <TextInput
                mode="outlined"
                label="Product Name"
                value={productName}
                onChangeText={setProductName}
                editable={isEditing}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                mode="outlined"
                label="Quantity"
                value={productQty}
                onChangeText={setProductQty}
                editable={isEditing}
                keyboardType="numeric"
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                mode="outlined"
                label="Price"
                value={productPrice}
                onChangeText={setProductPrice}
                editable={isEditing}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                mode="outlined"
                label="Category"
                value={productCategory}
                onChangeText={setProductCategory}
                editable={isEditing}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                mode="outlined"
                label="Expiry Date"
                value={productExpiry}
                editable={false}
                style={styles.input}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
                showSoftInputOnFocus={false}
                onFocus={isEditing ? openDatePicker : undefined}
                onPressIn={isEditing ? openDatePicker : undefined}
                right={
                  <TextInput.Icon
                    icon="calendar-month-outline"
                    onPress={isEditing ? openDatePicker : undefined}
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

              <Button
                mode="contained"
                style={styles.actionBtn}
                buttonColor={isEditing ? palette.primaryDark : palette.primary}
                textColor={palette.white}
                onPress={handlePrimaryAction}
                icon={isEditing ? "content-save-outline" : "pencil-outline"}
                loading={saving}
                disabled={saving}
              >
                {isEditing ? "Save Changes" : "Edit Product"}
              </Button>
            </Card.Content>
          </Card>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
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
    maxWidth: "85%",
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
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
    backgroundColor: palette.surface,
    marginBottom: spacing.sm,
  },
  actionBtn: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
  },
});
