import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Camera, useCameraDevices, useCameraPermission } from "react-native-vision-camera";
import { useBarcodeScannerOutput } from "react-native-vision-camera-barcode-scanner";
import Ionicons from "react-native-vector-icons/Ionicons";

import ScalePressable from "./ScalePressable";
import { palette, radii, spacing } from "../theme/appTheme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onScanned: (code: string) => void;
};

export default function BarcodeScannerModal({
  visible,
  onClose,
  onScanned,
}: Props) {
  const [cameraError, setCameraError] = useState("");
  const lockedRef = useRef(false);
  const devices = useCameraDevices();
  const { hasPermission, requestPermission } = useCameraPermission();

  const device = useMemo(
    () => devices.find((item) => item.position === "back") ?? devices[0],
    [devices]
  );

  const scannerOutput = useBarcodeScannerOutput({
    barcodeFormats: ["all-formats"],
    outputResolution: "preview",
    onBarcodeScanned: (barcodes) => {
      const value = barcodes[0]?.rawValue ?? barcodes[0]?.displayValue;
      if (!value || lockedRef.current) {
        return;
      }

      lockedRef.current = true;
      onScanned(value);
      setTimeout(() => {
        lockedRef.current = false;
      }, 1200);
    },
    onError: (error) => {
      setCameraError(error.message || "Unable to scan barcode.");
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Scan Barcode</Text>
            <ScalePressable onPress={onClose} style={styles.iconWrap}>
              <View style={styles.iconButton}>
                <Ionicons name="close" size={20} color={palette.text} />
              </View>
            </ScalePressable>
          </View>

          <Text style={styles.subtitle}>
            Align the barcode inside the camera view and hold steady.
          </Text>

          {!hasPermission ? (
            <View style={styles.stateCard}>
              <Ionicons name="camera-outline" size={30} color={palette.primaryDark} />
              <Text style={styles.stateTitle}>Camera permission required</Text>
              <Text style={styles.stateText}>
                Allow camera access so RetailX can scan product barcodes.
              </Text>
              <ScalePressable onPress={requestPermission} style={styles.stateActionWrap}>
                <View style={styles.stateAction}>
                  <Text style={styles.stateActionText}>Grant Permission</Text>
                </View>
              </ScalePressable>
            </View>
          ) : !device ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color={palette.primary} size="small" />
              <Text style={styles.stateTitle}>Loading camera</Text>
              <Text style={styles.stateText}>
                We are still looking for the back camera on this device.
              </Text>
            </View>
          ) : (
            <View style={styles.cameraWrap}>
              <Camera
                style={styles.camera}
                device={device}
                isActive={visible}
                outputs={[scannerOutput]}
                onError={(error) => {
                  setCameraError(error.message || "Camera unavailable.");
                }}
              />

              <View pointerEvents="none" style={styles.overlayFrame}>
                <View style={styles.frame} />
                <Text style={styles.frameLabel}>Center barcode here</Text>
              </View>
            </View>
          )}

          {cameraError ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={18} color={palette.danger} />
              <Text style={styles.errorText}>{cameraError}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.45)",
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: palette.subtext,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  iconWrap: {
    borderRadius: radii.pill,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraWrap: {
    height: 380,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: palette.dark,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  overlayFrame: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 260,
    height: 150,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: palette.white,
    backgroundColor: "transparent",
  },
  frameLabel: {
    marginTop: spacing.md,
    color: palette.white,
    fontWeight: "700",
  },
  stateCard: {
    height: 260,
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  stateTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  stateText: {
    color: palette.subtext,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  stateActionWrap: {
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  stateAction: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
  },
  stateActionText: {
    color: palette.white,
    fontWeight: "700",
  },
  errorBox: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#fef2f2",
    borderRadius: radii.md,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    color: palette.danger,
  },
});
