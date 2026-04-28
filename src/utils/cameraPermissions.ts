import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";
import { VisionCamera } from "react-native-vision-camera";

export async function ensureCameraPermission() {
  try {
    if (Platform.OS === "android") {
      const nativeGranted = await VisionCamera.requestCameraPermission();
      if (nativeGranted) {
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "RetailX needs camera access to scan products and barcodes.",
          buttonPositive: "Allow",
          buttonNegative: "Deny",
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return await VisionCamera.requestCameraPermission();
  } catch (error) {
    console.warn("Failed to request camera permission", error);
    return false;
  }
}

export function showCameraPermissionAlert() {
  Alert.alert(
    "Camera Permission Needed",
    "Please allow camera access to scan labels and barcodes. You can continue with manual entry if you prefer.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings().catch(() => undefined);
        },
      },
    ]
  );
}
