import { describe, it, expect } from "vitest";
import {
  performCalculation,
  validateInput,
  formatResult,
} from "../lib/calculator";
import {
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
} from "../lib/bitwise";
import { parseValue } from "../lib/base-converter";

describe("Calculator Functions", () => {
  describe("Basic Operations", () => {
    it("should perform addition correctly", () => {
      const result = performCalculation("5", "3", "+", 10, 32);
      expect(result).toBe(8);
    });

    it("should perform subtraction correctly", () => {
      const result = performCalculation("10", "4", "-", 10, 32);
      expect(result).toBe(6);
    });

    it("should perform multiplication correctly", () => {
      const result = performCalculation("7", "6", "*", 10, 32);
      expect(result).toBe(42);
    });

    it("should perform division correctly", () => {
      const result = performCalculation("15", "3", "/", 10, 32);
      expect(result).toBe(5);
    });

    it("should perform modulo correctly", () => {
      const result = performCalculation("17", "5", "%", 10, 32);
      expect(result).toBe(2);
    });

    it("should throw error on division by zero", () => {
      expect(() => performCalculation("10", "0", "/", 10, 32)).toThrow(
        "Division by zero"
      );
    });
  });

  describe("Bitwise Operations", () => {
    it("should perform AND operation correctly", () => {
      // 12 (1100) AND 10 (1010) = 8 (1000)
      const result = performCalculation("12", "10", "&", 10, 32);
      expect(result).toBe(8);
    });

    it("should perform OR operation correctly", () => {
      // 12 (1100) OR 10 (1010) = 14 (1110)
      const result = performCalculation("12", "10", "|", 10, 32);
      expect(result).toBe(14);
    });

    it("should perform XOR operation correctly", () => {
      // 12 (1100) XOR 10 (1010) = 6 (0110)
      const result = performCalculation("12", "10", "^", 10, 32);
      expect(result).toBe(6);
    });

    it("should perform NOT operation correctly", () => {
      // NOT uses previousValue (first parameter), so we're testing NOT 0 = 255
      const result = performCalculation("0", "5", "~", 10, 8);
      expect(result).toBe(255); // ~0 = 255 in 8-bit
    });

    it("should perform left shift correctly", () => {
      // 5 << 2 = 20
      const result = performCalculation("5", "2", "<<", 10, 32);
      expect(result).toBe(20);
    });

    it("should perform right shift correctly", () => {
      // 20 >> 2 = 5
      const result = performCalculation("20", "2", ">>", 10, 32);
      expect(result).toBe(5);
    });
  });

  describe("Different Base Operations", () => {
    it("should handle binary base operations", () => {
      // 1010 (10) + 0110 (6) = 10000 (16)
      const result = performCalculation("1010", "110", "+", 2, 32);
      expect(result).toBe(16);
    });

    it("should handle hexadecimal base operations", () => {
      // FF + 1 = 100 (256 in decimal)
      const result = performCalculation("FF", "1", "+", 16, 32);
      expect(result).toBe(256);
    });

    it("should handle octal base operations", () => {
      // 77 + 1 = 100 (64 in decimal)
      const result = performCalculation("77", "1", "+", 8, 32);
      expect(result).toBe(64);
    });
  });

  describe("Bit Width Constraints", () => {
    it("should respect 8-bit constraints", () => {
      // 255 + 1 should wrap to 0 in 8-bit
      const result = performCalculation("255", "1", "+", 10, 8);
      expect(result).toBe(0);
    });

    it("should respect 16-bit constraints", () => {
      // 65535 + 1 should wrap to 0 in 16-bit
      const result = performCalculation("65535", "1", "+", 10, 16);
      expect(result).toBe(0);
    });

    it("should handle negative results in limited bit width", () => {
      // 0 - 1 in 8-bit should be 255 (0xFF)
      const result = performCalculation("0", "1", "-", 10, 8);
      expect(result).toBe(255);
    });
  });

  describe("Input Validation", () => {
    it("should validate binary input correctly", () => {
      expect(validateInput("1010", 2)).toBe(true);
      expect(validateInput("1012", 2)).toBe(false);
      expect(validateInput("ABCD", 2)).toBe(false);
    });

    it("should validate octal input correctly", () => {
      expect(validateInput("1234567", 8)).toBe(true);
      expect(validateInput("1238", 8)).toBe(false);
      expect(validateInput("ABCD", 8)).toBe(false);
    });

    it("should validate decimal input correctly", () => {
      expect(validateInput("1234567890", 10)).toBe(true);
      expect(validateInput("123A", 10)).toBe(false);
    });

    it("should validate hexadecimal input correctly", () => {
      expect(validateInput("123456789ABCDEF", 16)).toBe(true);
      expect(validateInput("123G", 16)).toBe(false);
    });
  });

  describe("Format Result", () => {
    it("should format decimal result correctly", () => {
      expect(formatResult(255, 10)).toBe("255");
      expect(formatResult(-10, 10)).toBe("-10");
    });

    it("should format binary result correctly", () => {
      expect(formatResult(10, 2)).toBe("1010");
      expect(formatResult(255, 2)).toBe("11111111");
    });

    it("should format octal result correctly", () => {
      expect(formatResult(64, 8)).toBe("100");
      expect(formatResult(255, 8)).toBe("377");
    });

    it("should format hexadecimal result correctly", () => {
      expect(formatResult(255, 16)).toBe("FF");
      expect(formatResult(4095, 16)).toBe("FFF");
    });

    it("should handle invalid results", () => {
      expect(formatResult(NaN, 10)).toBe("Error");
      expect(formatResult(Infinity, 10)).toBe("Error");
      expect(formatResult(-Infinity, 10)).toBe("Error");
    });
  });
});

describe("Bitwise Operations Direct Tests", () => {
  describe("bitwiseAnd", () => {
    it("should perform AND correctly with different bit widths", () => {
      expect(bitwiseAnd(12, 10, 8)).toBe(8);
      expect(bitwiseAnd(255, 128, 8)).toBe(128);
    });
  });

  describe("bitwiseOr", () => {
    it("should perform OR correctly with different bit widths", () => {
      expect(bitwiseOr(12, 10, 8)).toBe(14);
      expect(bitwiseOr(240, 15, 8)).toBe(255);
    });
  });

  describe("bitwiseXor", () => {
    it("should perform XOR correctly with different bit widths", () => {
      expect(bitwiseXor(12, 10, 8)).toBe(6);
      expect(bitwiseXor(255, 255, 8)).toBe(0);
    });
  });

  describe("bitwiseNot", () => {
    it("should perform NOT correctly with different bit widths", () => {
      expect(bitwiseNot(0, 8)).toBe(255);
      expect(bitwiseNot(255, 8)).toBe(0);
      expect(bitwiseNot(0, 16)).toBe(65535);
    });
  });

  describe("leftShift", () => {
    it("should perform left shift correctly", () => {
      expect(leftShift(1, 1, 8)).toBe(2);
      expect(leftShift(1, 7, 8)).toBe(128);
      expect(leftShift(1, 8, 8)).toBe(0); // Should wrap in 8-bit
    });
  });

  describe("rightShift", () => {
    it("should perform right shift correctly", () => {
      expect(rightShift(128, 1, 8)).toBe(64);
      expect(rightShift(255, 4, 8)).toBe(15);
      expect(rightShift(1, 1, 8)).toBe(0);
    });
  });
});

describe("Base Conversion Tests", () => {
  describe("parseValue", () => {
    it("should parse binary values correctly", () => {
      expect(parseValue("1010", 2)).toBe(10);
      expect(parseValue("11111111", 2)).toBe(255);
    });

    it("should parse octal values correctly", () => {
      expect(parseValue("377", 8)).toBe(255);
      expect(parseValue("100", 8)).toBe(64);
    });

    it("should parse decimal values correctly", () => {
      expect(parseValue("255", 10)).toBe(255);
      expect(parseValue("1000", 10)).toBe(1000);
    });

    it("should parse hexadecimal values correctly", () => {
      expect(parseValue("FF", 16)).toBe(255);
      expect(parseValue("1000", 16)).toBe(4096);
      expect(parseValue("ABCD", 16)).toBe(43981);
    });

    it("should throw error for invalid input", () => {
      expect(() => parseValue("invalid", 10)).toThrow();
      expect(() => parseValue("2", 2)).toThrow();
      expect(() => parseValue("8", 8)).toThrow();
      expect(() => parseValue("G", 16)).toThrow();
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  it("should handle maximum values for each bit width", () => {
    // 8-bit max
    expect(formatResult(255, 16)).toBe("FF");
    // 16-bit max
    expect(formatResult(65535, 16)).toBe("FFFF");
    // 32-bit max
    expect(formatResult(4294967295, 16)).toBe("FFFFFFFF");
  });

  it("should handle zero values in all bases", () => {
    expect(formatResult(0, 2)).toBe("0");
    expect(formatResult(0, 8)).toBe("0");
    expect(formatResult(0, 10)).toBe("0");
    expect(formatResult(0, 16)).toBe("0");
  });

  it("should handle large shift operations", () => {
    // Shifting beyond bit width should result in 0
    expect(leftShift(1, 32, 32)).toBe(0);
    expect(leftShift(1, 64, 64)).toBe(0);
  });

  it("should handle overflow in different bit widths", () => {
    // Test 8-bit overflow
    const result8 = performCalculation("200", "100", "+", 10, 8);
    expect(result8).toBe(44); // 300 & 0xFF = 44

    // Test 16-bit overflow
    const result16 = performCalculation("60000", "10000", "+", 10, 16);
    expect(result16).toBe(4464); // 70000 & 0xFFFF = 4464
  });
});
