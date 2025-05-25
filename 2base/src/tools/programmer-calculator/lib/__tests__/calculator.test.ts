import { describe, it, expect } from "vitest";
import { performCalculation, formatResult, validateInput } from "../calculator";
import { convertBase, parseValue } from "../base-converter";
import { bitwiseAnd, bitwiseOr, bitwiseXor, bitwiseNot } from "../bitwise";

describe("Calculator Functions", () => {
  describe("performCalculation", () => {
    it("should perform basic arithmetic operations", () => {
      expect(performCalculation("10", "5", "+", 10, 32)).toBe(15);
      expect(performCalculation("10", "5", "-", 10, 32)).toBe(5);
      expect(performCalculation("10", "5", "*", 10, 32)).toBe(50);
      expect(performCalculation("10", "5", "/", 10, 32)).toBe(2);
      expect(performCalculation("10", "3", "%", 10, 32)).toBe(1);
    });

    it("should perform bitwise operations", () => {
      expect(performCalculation("12", "10", "&", 10, 32)).toBe(8); // 1100 & 1010 = 1000
      expect(performCalculation("12", "10", "|", 10, 32)).toBe(14); // 1100 | 1010 = 1110
      expect(performCalculation("12", "10", "^", 10, 32)).toBe(6); // 1100 ^ 1010 = 0110
    });

    it("should handle division by zero", () => {
      expect(() => performCalculation("10", "0", "/", 10, 32)).toThrow(
        "Division by zero"
      );
      expect(() => performCalculation("10", "0", "%", 10, 32)).toThrow(
        "Division by zero"
      );
    });
  });

  describe("Base Conversion", () => {
    it("should convert between different bases", () => {
      expect(convertBase("1010", 2, 10)).toBe("10");
      expect(convertBase("A", 16, 10)).toBe("10");
      expect(convertBase("12", 8, 10)).toBe("10");
      expect(convertBase("10", 10, 2)).toBe("1010");
      expect(convertBase("10", 10, 16)).toBe("A");
    });

    it("should parse values correctly", () => {
      expect(parseValue("1010", 2)).toBe(10);
      expect(parseValue("A", 16)).toBe(10);
      expect(parseValue("12", 8)).toBe(10);
      expect(parseValue("10", 10)).toBe(10);
    });
  });

  describe("Bitwise Operations", () => {
    it("should perform bitwise AND correctly", () => {
      expect(bitwiseAnd(12, 10, 32)).toBe(8);
      expect(bitwiseAnd(15, 7, 32)).toBe(7);
    });

    it("should perform bitwise OR correctly", () => {
      expect(bitwiseOr(12, 10, 32)).toBe(14);
      expect(bitwiseOr(8, 4, 32)).toBe(12);
    });

    it("should perform bitwise XOR correctly", () => {
      expect(bitwiseXor(12, 10, 32)).toBe(6);
      expect(bitwiseXor(15, 15, 32)).toBe(0);
    });

    it("should perform bitwise NOT correctly", () => {
      expect(bitwiseNot(0, 8)).toBe(255); // 8-bit NOT of 0 is 255
      expect(bitwiseNot(255, 8)).toBe(0); // 8-bit NOT of 255 is 0
    });
  });

  describe("Input Validation", () => {
    it("should validate binary input", () => {
      expect(validateInput("1010", 2)).toBe(true);
      expect(validateInput("1012", 2)).toBe(false);
    });

    it("should validate octal input", () => {
      expect(validateInput("1234567", 8)).toBe(true);
      expect(validateInput("12345678", 8)).toBe(false);
    });

    it("should validate decimal input", () => {
      expect(validateInput("1234567890", 10)).toBe(true);
      expect(validateInput("123A", 10)).toBe(false);
    });

    it("should validate hexadecimal input", () => {
      expect(validateInput("123ABCDEF", 16)).toBe(true);
      expect(validateInput("123G", 16)).toBe(false);
    });
  });

  describe("Result Formatting", () => {
    it("should format results correctly", () => {
      expect(formatResult(10, 2)).toBe("1010");
      expect(formatResult(10, 8)).toBe("12");
      expect(formatResult(10, 10)).toBe("10");
      expect(formatResult(10, 16)).toBe("A");
    });

    it("should handle negative numbers", () => {
      expect(formatResult(-10, 10)).toBe("-10");
    });

    it("should handle invalid numbers", () => {
      expect(formatResult(NaN, 10)).toBe("Error");
      expect(formatResult(Infinity, 10)).toBe("Error");
    });
  });
});
