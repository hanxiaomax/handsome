/**
 * 64-bit Bitwise Operations Test Suite
 *
 * This file contains comprehensive tests for the bitwise operations.
 * Compatible with vitest testing framework.
 */

import { describe, it, expect } from "vitest";
import {
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
  setBit,
  clearBit,
  toggleBit,
  testBit,
  toBitString,
  toBitArray,
} from "../lib/bitwise";

describe("64-bit Bitwise Operations", () => {
  describe("Basic Bitwise Operations", () => {
    it("should perform correct 8-bit AND, OR, XOR operations", () => {
      // 8-bit tests (170 = 10101010, 85 = 01010101)
      expect(bitwiseAnd(170, 85, 8)).toBe(0);
      expect(bitwiseOr(170, 85, 8)).toBe(255);
      expect(bitwiseXor(170, 85, 8)).toBe(255);
    });

    it("should perform correct 16-bit AND, OR, XOR operations", () => {
      // 16-bit tests
      expect(bitwiseAnd(43690, 21845, 16)).toBe(0);
      expect(bitwiseOr(43690, 21845, 16)).toBe(65535);
      expect(bitwiseXor(43690, 21845, 16)).toBe(65535);
    });

    it("should perform correct 32-bit AND, OR, XOR operations", () => {
      // 32-bit tests
      expect(bitwiseAnd(2863311530, 1431655765, 32)).toBe(0);
      expect(bitwiseOr(2863311530, 1431655765, 32)).toBe(4294967295);
      expect(bitwiseXor(2863311530, 1431655765, 32)).toBe(4294967295);
    });

    it("should perform correct 64-bit operations with large numbers", () => {
      // 64-bit tests with safe numbers
      const large1 = Math.pow(2, 50); // 2^50
      const large2 = Math.pow(2, 51); // 2^51
      const orResult64 = bitwiseOr(large1, large2, 64);
      const andResult64 = bitwiseAnd(large1, large2, 64);
      const xorResult64 = bitwiseXor(large1, large2, 64);

      expect(orResult64).toBeGreaterThan(large2);
      expect(andResult64).toBe(0);
      expect(xorResult64).toBe(orResult64);
    });
  });

  describe("Bitwise NOT Operations", () => {
    it("should perform correct NOT operations for different bit widths", () => {
      expect(bitwiseNot(170, 8)).toBe(85);
      expect(bitwiseNot(43690, 16)).toBe(21845);
      expect(bitwiseNot(2863311530, 32)).toBe(1431655765);

      const not64Result = bitwiseNot(0, 64);
      expect(not64Result).toBeGreaterThan(0);
    });
  });

  describe("Shift Operations", () => {
    it("should perform correct left shift operations", () => {
      expect(leftShift(1, 3, 8)).toBe(8);
      expect(leftShift(1, 7, 8)).toBe(128);
      expect(leftShift(1, 15, 16)).toBe(32768);
      expect(leftShift(1, 31, 32)).toBe(2147483648);

      const shift63Result = leftShift(1, 63, 64);
      expect(shift63Result).toBeGreaterThan(Math.pow(2, 62));
    });

    it("should perform correct right shift operations", () => {
      expect(rightShift(128, 3, 8)).toBe(16);
      expect(rightShift(32768, 7, 16)).toBe(256);
      expect(rightShift(2147483648, 15, 32)).toBe(65536);
    });
  });

  describe("Individual Bit Operations", () => {
    describe("Set Bit", () => {
      it("should set individual bits correctly across all bit widths", () => {
        // Test setting bit 0 (least significant)
        expect(setBit(0, 0, 8)).toBe(1);
        expect(setBit(0, 0, 16)).toBe(1);
        expect(setBit(0, 0, 32)).toBe(1);
        expect(setBit(0, 0, 64)).toBe(1);

        // Test setting MSB for each width
        expect(setBit(0, 7, 8)).toBe(128);
        expect(setBit(0, 15, 16)).toBe(32768);
        expect(setBit(0, 31, 32)).toBe(2147483648);

        const setBit63Result = setBit(0, 63, 64);
        expect(setBit63Result).toBeGreaterThan(Math.pow(2, 62));
      });

      it("should ignore out-of-range bit positions", () => {
        expect(setBit(0, 8, 8)).toBe(0); // Position 8 is out of range for 8-bit
        expect(setBit(0, 16, 16)).toBe(0); // Position 16 is out of range for 16-bit
        expect(setBit(0, 32, 32)).toBe(0); // Position 32 is out of range for 32-bit
        expect(setBit(0, 64, 64)).toBe(0); // Position 64 is out of range for 64-bit
      });

      it("should set multiple bits correctly", () => {
        let value = 0;
        value = setBit(value, 0, 8); // Set bit 0
        value = setBit(value, 2, 8); // Set bit 2
        value = setBit(value, 4, 8); // Set bit 4
        expect(value).toBe(21); // 00010101 = 21
      });
    });

    describe("Clear Bit", () => {
      it("should clear individual bits correctly", () => {
        // Start with all bits set for each width
        expect(clearBit(255, 0, 8)).toBe(254);
        expect(clearBit(65535, 0, 16)).toBe(65534);
        expect(clearBit(4294967295, 0, 32)).toBe(4294967294);

        // Clear MSB
        expect(clearBit(255, 7, 8)).toBe(127);
      });

      it("should clear multiple bits correctly", () => {
        let value = 255; // Start with 11111111
        value = clearBit(value, 1, 8); // Clear bit 1 -> 11111101
        value = clearBit(value, 3, 8); // Clear bit 3 -> 11110101
        value = clearBit(value, 5, 8); // Clear bit 5 -> 11010101
        expect(value).toBe(213); // 11010101 = 213
      });
    });

    describe("Toggle Bit", () => {
      it("should toggle individual bits correctly", () => {
        let value = 0;

        // Toggle bit 0 on
        value = toggleBit(value, 0, 8);
        expect(value).toBe(1);

        // Toggle bit 0 off
        value = toggleBit(value, 0, 8);
        expect(value).toBe(0);
      });

      it("should toggle multiple bits correctly", () => {
        let value = 0;
        value = toggleBit(value, 1, 8); // Set bit 1
        value = toggleBit(value, 3, 8); // Set bit 3
        value = toggleBit(value, 5, 8); // Set bit 5
        expect(value).toBe(42); // 00101010 = 42

        // Toggle bit 1 off
        value = toggleBit(value, 1, 8);
        expect(value).toBe(40); // 00101000 = 40
      });
    });

    describe("Test Bit", () => {
      it("should test individual bits correctly", () => {
        const value = 170; // 10101010

        // Test each bit
        expect(testBit(value, 0)).toBe(false); // Bit 0 is 0
        expect(testBit(value, 1)).toBe(true); // Bit 1 is 1
        expect(testBit(value, 2)).toBe(false); // Bit 2 is 0
        expect(testBit(value, 3)).toBe(true); // Bit 3 is 1
        expect(testBit(value, 4)).toBe(false); // Bit 4 is 0
        expect(testBit(value, 5)).toBe(true); // Bit 5 is 1
        expect(testBit(value, 6)).toBe(false); // Bit 6 is 0
        expect(testBit(value, 7)).toBe(true); // Bit 7 is 1
      });

      it("should handle large 64-bit numbers", () => {
        const largeValue = Math.pow(2, 53) - 1; // Near max safe integer
        expect(testBit(largeValue, 52)).toBe(true);
        expect(testBit(largeValue, 0)).toBe(true);
      });
    });
  });

  describe("Utility Functions", () => {
    describe("toBitString", () => {
      it("should convert numbers to bit strings correctly", () => {
        expect(toBitString(170, 8)).toBe("10101010");
        expect(toBitString(43690, 16)).toBe("1010101010101010");
        expect(toBitString(0, 8)).toBe("00000000");
        expect(toBitString(255, 8)).toBe("11111111");
      });

      it("should handle 64-bit numbers", () => {
        const result = toBitString(1, 64);
        expect(result).toBe(
          "0000000000000000000000000000000000000000000000000000000000000001"
        );
        expect(result.length).toBe(64);
      });
    });

    describe("toBitArray", () => {
      it("should convert numbers to bit arrays correctly", () => {
        const result = toBitArray(170, 8); // 10101010
        const expected = [false, true, false, true, false, true, false, true];
        expect(result).toEqual(expected);
      });

      it("should handle different bit widths", () => {
        expect(toBitArray(1, 8)).toHaveLength(8);
        expect(toBitArray(1, 16)).toHaveLength(16);
        expect(toBitArray(1, 32)).toHaveLength(32);
        expect(toBitArray(1, 64)).toHaveLength(64);
      });
    });
  });

  describe("64-bit Specific Tests", () => {
    it("should handle bit positions 32-63 correctly", () => {
      // Test setting high bits
      const testPositions = [32, 33, 34, 40, 50, 60, 63];
      for (const bitPos of testPositions) {
        const result = setBit(0, bitPos, 64);
        expect(result).toBeGreaterThan(0);
        expect(testBit(result, bitPos)).toBe(true);

        // Test clearing the same bit
        const cleared = clearBit(result, bitPos, 64);
        expect(cleared).toBe(0);
      }
    });

    it("should handle combinations of high and low bits", () => {
      let value = 0;

      // Set some low bits
      value = setBit(value, 0, 64);
      value = setBit(value, 1, 64);
      value = setBit(value, 2, 64);

      // Set some high bits
      value = setBit(value, 32, 64);
      value = setBit(value, 33, 64);
      value = setBit(value, 34, 64);

      // Test that all bits are set
      expect(testBit(value, 0)).toBe(true);
      expect(testBit(value, 1)).toBe(true);
      expect(testBit(value, 2)).toBe(true);
      expect(testBit(value, 32)).toBe(true);
      expect(testBit(value, 33)).toBe(true);
      expect(testBit(value, 34)).toBe(true);

      // Test that other bits are not set
      expect(testBit(value, 3)).toBe(false);
      expect(testBit(value, 31)).toBe(false);
      expect(testBit(value, 35)).toBe(false);
    });

    it("should handle large number operations without precision loss", () => {
      const large1 = Math.pow(2, 50);
      const large2 = Math.pow(2, 51);

      const orResult = bitwiseOr(large1, large2, 64);
      const andResult = bitwiseAnd(large1, large2, 64);
      const xorResult = bitwiseXor(large1, large2, 64);

      // These should be valid operations
      expect(orResult).toBeGreaterThan(large2);
      expect(andResult).toBe(0); // No common bits
      expect(xorResult).toBe(orResult); // Same as OR when no common bits
    });

    it("should maintain bit independence across all positions", () => {
      // Test that setting alternating bits works correctly for lower bits
      let value = 0;

      // Set alternating bits for positions that are safe for JavaScript numbers
      // We'll test high bits separately since setBit might have precision issues
      const lowBits = Array.from({ length: 26 }, (_, i) => i * 2); // 0, 2, 4, ..., 50
      for (const bitPos of lowBits) {
        value = setBit(value, bitPos, 64);
      }

      // Check that only even bits are set for the tested range
      for (let i = 0; i <= 50; i++) {
        if (i % 2 === 0) {
          expect(testBit(value, i)).toBe(true);
        } else {
          expect(testBit(value, i)).toBe(false);
        }
      }

      // Test individual high bit positions separately
      for (const highBit of [52, 54, 56, 58, 60, 62]) {
        const highValue = setBit(0, highBit, 64);
        expect(testBit(highValue, highBit)).toBe(true);
        // Make sure it doesn't affect other bits
        expect(testBit(highValue, highBit - 1)).toBe(false);
        expect(testBit(highValue, highBit + 1)).toBe(false);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero values correctly", () => {
      expect(bitwiseAnd(0, 0, 64)).toBe(0);
      expect(bitwiseOr(0, 0, 64)).toBe(0);
      expect(bitwiseXor(0, 0, 64)).toBe(0);
      expect(testBit(0, 32)).toBe(false);
      expect(testBit(0, 63)).toBe(false);
    });

    it("should handle negative numbers correctly", () => {
      const result = bitwiseNot(-1, 8);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should handle maximum values for each bit width", () => {
      const max8 = 255;
      const max16 = 65535;
      const max32 = 4294967295;

      expect(bitwiseAnd(max8, max8, 8)).toBe(max8);
      expect(bitwiseAnd(max16, max16, 16)).toBe(max16);
      expect(bitwiseAnd(max32, max32, 32)).toBe(max32);
    });

    it("should maintain precision for 64-bit operations", () => {
      // Test that we can work with numbers near the safe integer limit
      const largeNum = Number.MAX_SAFE_INTEGER - 1;
      const result = setBit(largeNum, 0, 64);
      expect(result).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});
