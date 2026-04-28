import TextRecognition from "@react-native-ml-kit/text-recognition";
import { launchCamera } from "react-native-image-picker";

import { parseProductLabel } from "../utils/ocrParser";

export async function scanProductLabelFromCamera() {
  const result = await launchCamera({
    mediaType: "photo",
    cameraType: "back",
    quality: 0.8,
    saveToPhotos: false,
  });

  if (result.didCancel) {
    return { cancelled: true as const };
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage || "Unable to open camera.");
  }

  const asset = result.assets?.[0];
  const imageUri = asset?.uri;

  if (!imageUri) {
    throw new Error("No image was captured.");
  }

  const recognition = await TextRecognition.recognize(imageUri);
  const parsed = parseProductLabel(recognition.text);
  console.log("OCR raw text:", recognition.text);
  console.log("OCR parsed fields:", parsed);

  return {
    cancelled: false as const,
    rawText: recognition.text,
    parsed,
    imageUri,
  };
}
