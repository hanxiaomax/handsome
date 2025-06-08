import type { BitWidth } from "../types";
import { applyBitWidth } from "./base-converter";

export function bitwiseAnd(a: number, b: number, bitWidth: BitWidth): number {
  const result = a & b;
  return applyBitWidth(result, bitWidth);
}

export function bitwiseOr(a: number, b: number, bitWidth: BitWidth): number {
  const result = a | b;
  return applyBitWidth(result, bitWidth);
}

export function bitwiseXor(a: number, b: number, bitWidth: BitWidth): number {
  const result = a ^ b;
  return applyBitWidth(result, bitWidth);
}

export function bitwiseNot(value: number, bitWidth: BitWidth): number {
  const mask = (1 << bitWidth) - 1;
  const result = ~value & mask;
  return applyBitWidth(result, bitWidth);
}

export function leftShift(
  value: number,
  positions: number,
  bitWidth: BitWidth
): number {
  const result = value << positions;
  return applyBitWidth(result, bitWidth);
}

export function rightShift(
  value: number,
  positions: number,
  bitWidth: BitWidth
): number {
  const constrainedValue = applyBitWidth(value, bitWidth);
  const result = constrainedValue >>> positions;
  return applyBitWidth(result, bitWidth);
}

export function setBit(
  value: number,
  position: number,
  bitWidth: BitWidth
): number {
  const result = value | (1 << position);
  return applyBitWidth(result, bitWidth);
}

export function clearBit(
  value: number,
  position: number,
  bitWidth: BitWidth
): number {
  const result = value & ~(1 << position);
  return applyBitWidth(result, bitWidth);
}

export function toggleBit(
  value: number,
  position: number,
  bitWidth: BitWidth
): number {
  const result = value ^ (1 << position);
  return applyBitWidth(result, bitWidth);
}

export function testBit(value: number, position: number): boolean {
  return (value & (1 << position)) !== 0;
}
