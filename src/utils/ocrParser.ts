export type ParsedLabel = {
  barcode: string;
  name: string;
  category: string;
  price: string;
  quantity: string;
  expiryDate: string;
};

const barcodePatterns = [/\b\d{8,13}\b/];
const pricePatterns = [
  /(?:rs\.?|inr|mrp)\s*[:-]?\s*(\d+(?:\.\d{1,2})?)/i,
  /(?:^|\s)(\d{1,4}(?:\.\d{1,2})?)\s*(?:rs\.?|inr)(?:\s|$)/i,
];
const quantityPatterns = [
  /(?:qty|quantity|pcs|pieces|pack)\s*[:\-]?\s*(\d{1,4})/i,
  /\b(\d{1,4})\s*(?:pcs|pieces|pack)\b/i,
];
const expiryPatterns = [
  /(?:exp|expiry|expires?)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  /(?:exp|expiry|expires?)\s*[:\-]?\s*([a-z]{3,9}\s+\d{2,4})/i,
];
const categoryKeywords = [
  "dairy",
  "bakery",
  "fruits",
  "vegetables",
  "beverages",
  "snacks",
  "grocery",
  "personal care",
  "household",
];
const lowConfidenceWords = [
  "fresh",
  "best",
  "premium",
  "offer",
  "save",
  "shop",
  "store",
  "batch",
];

const cleanDetectedValue = (value: string) =>
  value
    .replace(/[^\w\s./:-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "")
    .trim();

const findFirstMatch = (patterns: RegExp[], text: string) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return cleanDetectedValue(match[1]);
    }
    if (match?.[0] && patterns === barcodePatterns) {
      return cleanDetectedValue(match[0]);
    }
  }

  return "";
};

const findCategory = (lines: string[]) => {
  const lowerLines = lines.map((line) => line.toLowerCase());

  for (const keyword of categoryKeywords) {
    if (lowerLines.some((line) => line.includes(keyword))) {
      return keyword
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
  }

  return "";
};

const isUsefulNameLine = (line: string) => {
  const cleaned = line.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  if (cleaned.length < 3) {
    return false;
  }

  if (/\b(rs|inr|mrp|qty|quantity|exp|expiry|barcode)\b/i.test(cleaned)) {
    return false;
  }

  if (/^\d+$/.test(cleaned)) {
    return false;
  }

  if (/\d{8,13}/.test(cleaned)) {
    return false;
  }

  if (lowConfidenceWords.some((word) => cleaned.toLowerCase() === word)) {
    return false;
  }

  return true;
};

const isValidPrice = (value: string) => /^\d+(?:\.\d{1,2})?$/.test(value);
const isValidQuantity = (value: string) => /^\d+$/.test(value);
const isValidExpiry = (value: string) =>
  /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[a-z]{3,9}\s+\d{2,4})$/i.test(value);

export function parseProductLabel(text: string): ParsedLabel {
  const normalized = cleanDetectedValue(text);
  const lines = text
    .split(/\r?\n/)
    .map((line) => cleanDetectedValue(line))
    .filter(Boolean);

  const barcodeMatch = findFirstMatch(barcodePatterns, normalized);
  const priceMatch = findFirstMatch(pricePatterns, normalized);
  const quantityMatch = findFirstMatch(quantityPatterns, normalized);
  const expiryMatch = findFirstMatch(expiryPatterns, normalized);
  const category = findCategory(lines);

  const candidateName = lines.find((line) => isUsefulNameLine(line)) || "";
  const name = cleanDetectedValue(candidateName);
  const barcode = /^\d{8,13}$/.test(barcodeMatch) ? barcodeMatch : "";
  const price = isValidPrice(priceMatch) ? priceMatch : "";
  const quantity = isValidQuantity(quantityMatch) ? quantityMatch : "";
  const expiryDate = isValidExpiry(expiryMatch) ? expiryMatch : "";

  return {
    barcode,
    name,
    category,
    price,
    quantity,
    expiryDate,
  };
}
