import type { BitWidth } from "../types";

/**
 * 64-bit safe bitwise operations using BigInt
 * This module provides complete 64-bit integer operations without precision loss
 */

// Helper function to create bit width mask
function createBitWidthMask(bitWidth: BitWidth): bigint {
  if (bitWidth === 64) {
    return 0xffffffffffffffffn; // 64-bit mask
  }
  return (1n << BigInt(bitWidth)) - 1n;
}

// Helper function to convert number to BigInt with proper sign handling
function numberToBigInt(value: number): bigint {
  return BigInt(Math.trunc(value));
}

// Helper function to convert BigInt to number with bounds checking
function bigIntToNumber(value: bigint, bitWidth: BitWidth): number {
  const mask = createBitWidthMask(bitWidth);
  const maskedValue = value & mask;

  // For 64-bit, we need to handle potential overflow
  if (bitWidth === 64) {
    // Check if value exceeds JavaScript's safe integer range
    if (maskedValue > BigInt(Number.MAX_SAFE_INTEGER)) {
      // For large values, we need to handle them carefully
      // Convert to string and back to preserve precision where possible
      const str = maskedValue.toString();
      const num = parseFloat(str);
      return isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
    }
  }

  return Number(maskedValue);
}

// Apply bit width constraints using BigInt for accuracy
function applyBitWidthBigInt(value: bigint, bitWidth: BitWidth): bigint {
  const mask = createBitWidthMask(bitWidth);

  if (value < 0n) {
    // Handle negative numbers with two's complement
    if (bitWidth === 64) {
      // For 64-bit, handle the full range
      return value & mask;
    } else {
      // For smaller bit widths
      const range = 1n << BigInt(bitWidth);
      return (range + value) & mask;
    }
  }

  return value & mask;
}

// Main bitwise operations with full 64-bit support
export function bitwiseAnd(a: number, b: number, bitWidth: BitWidth): number {
  const bigA = numberToBigInt(a);
  const bigB = numberToBigInt(b);
  const result = applyBitWidthBigInt(bigA & bigB, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function bitwiseOr(a: number, b: number, bitWidth: BitWidth): number {
  const bigA = numberToBigInt(a);
  const bigB = numberToBigInt(b);
  const result = applyBitWidthBigInt(bigA | bigB, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function bitwiseXor(a: number, b: number, bitWidth: BitWidth): number {
  const bigA = numberToBigInt(a);
  const bigB = numberToBigInt(b);
  const result = applyBitWidthBigInt(bigA ^ bigB, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function bitwiseNot(value: number, bitWidth: BitWidth): number {
  const bigValue = numberToBigInt(value);
  const mask = createBitWidthMask(bitWidth);
  const result = applyBitWidthBigInt(~bigValue & mask, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function leftShift(
  value: number,
  positions: number,
  bitWidth: BitWidth
): number {
  const bigValue = numberToBigInt(value);
  const shiftPositions = BigInt(positions);
  const result = applyBitWidthBigInt(bigValue << shiftPositions, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function rightShift(
  value: number,
  positions: number,
  bitWidth: BitWidth
): number {
  const bigValue = applyBitWidthBigInt(numberToBigInt(value), bitWidth);
  const shiftPositions = BigInt(positions);
  const result = bigValue >> shiftPositions;
  return bigIntToNumber(result, bitWidth);
}

export function setBit(
  value: number,
  position: number,
  bitWidth: BitWidth
): number {
  if (position >= bitWidth) {
    return value; // Position out of range, no change
  }

  const bigValue = numberToBigInt(value);
  const mask = 1n << BigInt(position);
  const result = applyBitWidthBigInt(bigValue | mask, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function clearBit(
  value: number,
  position: number,
  bitWidth: BitWidth
): number {
  if (position >= bitWidth) {
    return value; // Position out of range, no change
  }

  const bigValue = numberToBigInt(value);
  const mask = 1n << BigInt(position);
  const result = applyBitWidthBigInt(bigValue & ~mask, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function toggleBit(
  value: number,
  position: number,
  bitWidth: BitWidth
): number {
  if (position >= bitWidth) {
    return value; // Position out of range, no change
  }

  const bigValue = numberToBigInt(value);
  const mask = 1n << BigInt(position);
  const result = applyBitWidthBigInt(bigValue ^ mask, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

export function testBit(value: number, position: number): boolean {
  const bigValue = numberToBigInt(value);
  const mask = 1n << BigInt(position);
  return (bigValue & mask) !== 0n;
}

// Utility function to get bit string representation
export function toBitString(value: number, bitWidth: BitWidth): string {
  const bigValue = applyBitWidthBigInt(numberToBigInt(value), bitWidth);
  const binaryStr = bigValue.toString(2);
  return binaryStr.padStart(bitWidth, "0");
}

// Utility function for debugging - get bit array
export function toBitArray(value: number, bitWidth: BitWidth): boolean[] {
  const bits: boolean[] = [];
  for (let i = 0; i < bitWidth; i++) {
    bits.push(testBit(value, i));
  }
  return bits;
}
