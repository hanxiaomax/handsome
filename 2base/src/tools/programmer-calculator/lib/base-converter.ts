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
  // Handle 64-bit case specially due to JavaScript precision limits
  if (bitWidth === 64) {
    // For 64-bit, we need to handle the value carefully
    if (value < 0) {
      // Two's complement for negative numbers
      const bigValue = BigInt(value);
      const mask = (1n << 64n) - 1n;
      const result = ((1n << 64n) + bigValue) & mask;
      return Number(result);
    } else {
      // For positive numbers, ensure we don't exceed safe range
      return value;
    }
  }

  // For other bit widths, use bitwise operations correctly
  if (bitWidth === 32) {
    // Special handling for 32-bit to avoid sign conversion issues
    return value >>> 0; // Unsigned right shift converts to unsigned 32-bit
  }

  // For smaller bit widths
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
 * Parse input value considering the current base and apply bit width constraints
 */
export function parseValue(
  input: string,
  base: Base,
  bitWidth?: BitWidth
): number {
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

  // Apply bit width constraints if specified
  if (bitWidth !== undefined) {
    return applyBitWidth(result, bitWidth);
  }

  return result;
}

/**
 * Get maximum value for a specific bit width
 */
export function getMaxValueForBitWidth(bitWidth: BitWidth): number {
  if (bitWidth === 64) {
    return Number.MAX_SAFE_INTEGER; // For 64-bit, use safe integer limit
  }
  return Math.pow(2, bitWidth) - 1;
}

/**
 * Check if a value exceeds the maximum for the given bit width
 */
export function exceedsMaxValue(value: number, bitWidth: BitWidth): boolean {
  const maxValue = getMaxValueForBitWidth(bitWidth);
  return value > maxValue;
}
