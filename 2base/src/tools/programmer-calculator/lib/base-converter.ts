import type { Base, BitWidth } from "../types";

/**
 * Convert a number from one base to another
 */
export function convertBase(
  value: string,
  fromBase: Base,
  toBase: Base
): string {
  if (!value || value === "0") return "0";

  try {
    // Parse the value in the source base
    const decimal = parseInt(value, fromBase);

    if (isNaN(decimal)) {
      throw new Error("Invalid number format");
    }

    // Convert to target base
    return decimal.toString(toBase).toUpperCase();
  } catch (error) {
    throw new Error(
      `Conversion error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Format number for display in specific base
 */
export function formatForBase(value: string, base: Base): string {
  if (!value || value === "0") return "0";

  const num = parseInt(value, 10);
  if (isNaN(num)) return "0";

  switch (base) {
    case 2:
      return num.toString(2);
    case 8:
      return num.toString(8);
    case 10:
      return num.toString(10);
    case 16:
      return num.toString(16).toUpperCase();
    default:
      return value;
  }
}

/**
 * Get the prefix for a base
 */
export function getBasePrefix(base: Base): string {
  switch (base) {
    case 2:
      return "0b";
    case 8:
      return "0o";
    case 10:
      return "";
    case 16:
      return "0x";
    default:
      return "";
  }
}

/**
 * Validate if a character is valid for the given base
 */
export function isValidDigitForBase(digit: string, base: Base): boolean {
  const validDigits = {
    2: "01",
    8: "01234567",
    10: "0123456789",
    16: "0123456789ABCDEFabcdef",
  };

  return validDigits[base].includes(digit);
}

/**
 * Apply bit width constraints to a number
 */
export function applyBitWidth(value: number, bitWidth: BitWidth): number {
  const maxValue = Math.pow(2, bitWidth) - 1;

  // Handle negative numbers using two's complement
  if (value < 0) {
    return (Math.pow(2, bitWidth) + value) & maxValue;
  }

  return value & maxValue;
}

/**
 * Convert decimal to binary with specified bit width
 */
export function toBinaryWithWidth(value: number, bitWidth: BitWidth): string {
  const constrainedValue = applyBitWidth(value, bitWidth);
  return constrainedValue.toString(2).padStart(bitWidth, "0");
}

/**
 * Parse input value considering the current base
 */
export function parseValue(input: string, base: Base): number {
  if (!input || input === "0") return 0;

  // Remove base prefixes if present
  let cleanInput = input;
  if (input.startsWith("0x") || input.startsWith("0X")) {
    cleanInput = input.slice(2);
  } else if (input.startsWith("0b") || input.startsWith("0B")) {
    cleanInput = input.slice(2);
  } else if (input.startsWith("0o") || input.startsWith("0O")) {
    cleanInput = input.slice(2);
  }

  const result = parseInt(cleanInput, base);
  if (isNaN(result)) {
    throw new Error("Invalid number format");
  }

  return result;
}
