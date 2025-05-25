import type { Base, BitWidth } from "../types";
import { getBasePrefix, toBinaryWithWidth } from "./base-converter";

export function formatDisplayValue(value: string, base: Base): string {
  if (!value || value === "0") return "0";

  const prefix = getBasePrefix(base);
  return `${prefix}${value}`;
}

export function formatBinaryDisplay(value: number, bitWidth: BitWidth): string {
  const binary = toBinaryWithWidth(value, bitWidth);

  // Group bits in chunks of 4 for better readability
  const chunks = [];
  for (let i = 0; i < binary.length; i += 4) {
    chunks.push(binary.slice(i, i + 4));
  }

  return chunks.join(" ");
}

export function formatNumberWithSeparators(value: string, base: Base): string {
  if (!value || value === "0") return "0";

  // Add separators for better readability
  switch (base) {
    case 2:
      // Group binary digits in groups of 4
      return value.replace(/(.{4})/g, "$1 ").trim();
    case 8:
      // Group octal digits in groups of 3
      return value.replace(/(.{3})/g, "$1 ").trim();
    case 10:
      // Add commas for thousands
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    case 16:
      // Group hex digits in groups of 4
      return value.replace(/(.{4})/g, "$1 ").trim();
    default:
      return value;
  }
}

export function getBaseLabel(base: Base): string {
  switch (base) {
    case 2:
      return "BIN";
    case 8:
      return "OCT";
    case 10:
      return "DEC";
    case 16:
      return "HEX";
    default:
      return "UNK";
  }
}

export function getBitWidthLabel(bitWidth: BitWidth): string {
  return `${bitWidth}-bit`;
}

export function truncateForDisplay(
  value: string,
  maxLength: number = 20
): string {
  if (value.length <= maxLength) return value;

  return value.slice(0, maxLength - 3) + "...";
}
