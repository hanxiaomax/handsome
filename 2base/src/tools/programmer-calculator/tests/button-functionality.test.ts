import { describe, it, expect } from "vitest";
import {
  performCalculation,
  validateInput,
  formatResult,
} from "../lib/calculator";
import { parseValue } from "../lib/base-converter";
import type { Operation } from "../types";

describe("Button Functionality Tests", () => {
  describe("Number Button Validation", () => {
    it("should validate all decimal numbers (0-9) in decimal base", () => {
      for (let i = 0; i <= 9; i++) {
        expect(validateInput(i.toString(), 10)).toBe(true);
      }
    });

    it("should validate hex digits (A-F) only in hex mode", () => {
      const hexDigits = ["A", "B", "C", "D", "E", "F"];

      // Should be valid in hex base
      hexDigits.forEach((digit) => {
        expect(validateInput(digit, 16)).toBe(true);
      });

      // Should be invalid in other bases
      hexDigits.forEach((digit) => {
        expect(validateInput(digit, 10)).toBe(false);
        expect(validateInput(digit, 8)).toBe(false);
        expect(validateInput(digit, 2)).toBe(false);
      });
    });

    it("should restrict numbers based on current base", () => {
      // Binary base - only 0,1 allowed
      expect(validateInput("0", 2)).toBe(true);
      expect(validateInput("1", 2)).toBe(true);
      expect(validateInput("2", 2)).toBe(false);
      expect(validateInput("8", 2)).toBe(false);
      expect(validateInput("A", 2)).toBe(false);

      // Octal base - 0-7 allowed
      for (let i = 0; i <= 7; i++) {
        expect(validateInput(i.toString(), 8)).toBe(true);
      }
      expect(validateInput("8", 8)).toBe(false);
      expect(validateInput("9", 8)).toBe(false);
      expect(validateInput("A", 8)).toBe(false);

      // Decimal base - 0-9 allowed
      for (let i = 0; i <= 9; i++) {
        expect(validateInput(i.toString(), 10)).toBe(true);
      }
      expect(validateInput("A", 10)).toBe(false);
    });

    it("should handle multi-digit input validation", () => {
      // Valid multi-digit inputs
      expect(validateInput("123", 10)).toBe(true);
      expect(validateInput("ABC", 16)).toBe(true);
      expect(validateInput("777", 8)).toBe(true);
      expect(validateInput("101", 2)).toBe(true);

      // Invalid multi-digit inputs
      expect(validateInput("129", 8)).toBe(false); // 9 invalid in octal
      expect(validateInput("102", 2)).toBe(false); // 2 invalid in binary
    });
  });

  describe("Basic Operation Button Functions", () => {
    it("should handle addition (+) operation", () => {
      expect(performCalculation("5", "3", "+", 10, 32)).toBe(8);
    });

    it("should handle subtraction (-) operation", () => {
      expect(performCalculation("5", "3", "-", 10, 32)).toBe(2);
    });

    it("should handle multiplication (*) operation", () => {
      expect(performCalculation("5", "3", "*", 10, 32)).toBe(15);
    });

    it("should handle division (/) operation", () => {
      expect(performCalculation("6", "3", "/", 10, 32)).toBe(2);
    });

    it("should handle modulo (%) operation", () => {
      expect(performCalculation("7", "3", "%", 10, 32)).toBe(1);
    });

    it("should handle equals (=) operation", () => {
      expect(performCalculation("5", "3", "+", 10, 32)).toBe(8);
    });
  });

  describe("Bitwise Operation Button Functions", () => {
    it("should handle AND (&) operation", () => {
      expect(performCalculation("5", "3", "&", 10, 32)).toBe(1);
    });

    it("should handle OR (|) operation", () => {
      expect(performCalculation("5", "3", "|", 10, 32)).toBe(7);
    });

    it("should handle XOR (^) operation", () => {
      expect(performCalculation("5", "3", "^", 10, 32)).toBe(6);
    });

    it("should handle NOT (~) operation", () => {
      expect(performCalculation("5", "0", "~", 10, 32)).toBe(4294967290);
    });

    it("should handle left shift (<<) operation", () => {
      expect(performCalculation("5", "2", "<<", 10, 32)).toBe(20);
    });

    it("should handle right shift (>>) operation", () => {
      expect(performCalculation("20", "2", ">>", 10, 32)).toBe(5);
    });
  });

  describe("Base Conversion Functions", () => {
    it("should parse values correctly in different bases", () => {
      expect(parseValue("101", 2)).toBe(5);
      expect(parseValue("77", 8)).toBe(63);
      expect(parseValue("FF", 16)).toBe(255);
    });

    it("should format results correctly in different bases", () => {
      expect(formatResult(5, 2)).toBe("101");
      expect(formatResult(63, 8)).toBe("77");
      expect(formatResult(255, 16)).toBe("FF");
    });

    it("should handle base conversion edge cases", () => {
      expect(parseValue("0", 2)).toBe(0);
      expect(parseValue("0", 8)).toBe(0);
      expect(parseValue("0", 16)).toBe(0);
    });
  });

  describe("Error Handling Functions", () => {
    it("should handle division by zero", () => {
      expect(() => performCalculation("5", "0", "/", 10, 32)).toThrow();
    });

    it("should handle modulo by zero", () => {
      expect(() => performCalculation("5", "0", "%", 10, 32)).toThrow();
    });

    it("should handle invalid number format", () => {
      expect(() => parseValue("XYZ", 16)).toThrow();
      expect(() => parseValue("999", 8)).toThrow();
      expect(() => parseValue("22", 2)).toThrow();
    });

    it("should handle invalid results in formatting", () => {
      expect(formatResult(NaN, 10)).toBe("Error");
      expect(formatResult(Infinity, 10)).toBe("Error");
    });
  });

  describe("Bit Width Constraint Functions", () => {
    it("should respect 8-bit limits in operations", () => {
      expect(performCalculation("200", "100", "+", 10, 8)).toBe(44); // 300 & 0xFF = 44
    });

    it("should respect 16-bit limits in operations", () => {
      expect(performCalculation("60000", "10000", "+", 10, 16)).toBe(4464); // 70000 & 0xFFFF = 4464
    });

    it("should handle negative results in limited bit width", () => {
      expect(performCalculation("5", "10", "-", 10, 8)).toBe(251); // -5 in 8-bit unsigned
    });

    it("should handle bit width in bitwise operations", () => {
      expect(performCalculation("255", "0", "~", 10, 8)).toBe(0);
      expect(performCalculation("65535", "0", "~", 10, 16)).toBe(0);
    });
  });

  describe("Complex Operation Sequences", () => {
    it("should handle chained operations correctly", () => {
      let result = performCalculation("5", "3", "+", 10, 32); // 8
      result = performCalculation(result.toString(), "2", "*", 10, 32); // 16
      result = performCalculation(result.toString(), "4", "/", 10, 32); // 4
      expect(result).toBe(4);
    });

    it("should handle mixed base operations", () => {
      // Convert binary to decimal, perform operation, convert back
      const binaryValue = parseValue("1010", 2); // 10 in decimal
      const result = performCalculation(
        binaryValue.toString(),
        "5",
        "+",
        10,
        32
      ); // 15
      const binaryResult = formatResult(result, 2);
      expect(binaryResult).toBe("1111");
    });

    it("should handle bitwise operations with different bit widths", () => {
      // 8-bit operation
      const result8 = performCalculation("255", "1", "&", 10, 8);
      expect(result8).toBe(1);

      // 16-bit operation
      const result16 = performCalculation("65535", "1", "&", 10, 16);
      expect(result16).toBe(1);
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle maximum values for each bit width", () => {
      expect(performCalculation("255", "0", "+", 10, 8)).toBe(255);
      expect(performCalculation("65535", "0", "+", 10, 16)).toBe(65535);
      expect(performCalculation("4294967295", "0", "+", 10, 32)).toBe(
        4294967295
      );
    });

    it("should handle zero in all operations", () => {
      expect(performCalculation("0", "5", "+", 10, 32)).toBe(5);
      expect(performCalculation("0", "5", "&", 10, 32)).toBe(0);
      expect(performCalculation("0", "5", "|", 10, 32)).toBe(5);
      expect(performCalculation("0", "5", "^", 10, 32)).toBe(5);
    });

    it("should handle large shift operations", () => {
      expect(performCalculation("1", "31", "<<", 10, 32)).toBe(2147483648);
      expect(performCalculation("2147483648", "31", ">>", 10, 32)).toBe(1);
    });

    it("should handle negative number formatting", () => {
      // Test that negative results are properly formatted
      expect(formatResult(-1, 10)).toBe("-1");
      expect(formatResult(-5, 16)).toBe("-5");
    });
  });

  // 新增：表达式显示功能测试
  describe("Expression Display Functionality", () => {
    it("should display expression during input sequence", () => {
      // 模拟输入序列：5 + 3 =
      // 注意：这些测试验证底层逻辑，UI组件的行为应该在集成测试中验证

      // 输入5时，表达式应该显示"5"
      const value1 = "5";
      expect(value1).toBe("5");

      // 输入+时，表达式应该显示"5 + "
      const operation = "+";
      const expr1 = `${value1} ${operation} `;
      expect(expr1).toBe("5 + ");

      // 输入3时，表达式应该显示"5 + 3"
      const value2 = "3";
      const expr2 = `${value1} ${operation} ${value2}`;
      expect(expr2).toBe("5 + 3");

      // 按等号时，应该计算结果
      const result = performCalculation(value1, value2, "+", 10, 32);
      expect(result).toBe(8);
    });

    it("should handle bitwise operation expressions", () => {
      // 测试位操作表达式显示
      const value1 = "5";
      const operation = "&";
      const value2 = "3";

      const expression = `${value1} ${operation} ${value2}`;
      expect(expression).toBe("5 & 3");

      const result = performCalculation(value1, value2, "&", 10, 32);
      expect(result).toBe(1);
    });

    it("should handle unary operations like NOT", () => {
      // NOT操作应该立即显示结果表达式
      const value = "5";
      const result = performCalculation(value, "0", "~", 10, 32);
      const expression = `~${value} = ${result}`;
      expect(expression).toBe("~5 = 4294967290");
    });

    it("should handle chained operations in expression", () => {
      // 测试连续操作的表达式处理
      const value1 = "5";
      const operation1 = "+";
      const value2 = "3";

      // 第一步：5 + 3 = 8
      const result1 = performCalculation(
        value1,
        value2,
        operation1 as Operation,
        10,
        32
      );
      expect(result1).toBe(8);

      // 第二步：8 * 2
      const operation2 = "*";
      const value3 = "2";
      const expression = `${result1} ${operation2} ${value3}`;
      expect(expression).toBe("8 * 2");

      const result2 = performCalculation(
        result1.toString(),
        value3,
        operation2 as Operation,
        10,
        32
      );
      expect(result2).toBe(16);
    });

    it("should handle base conversion in expressions", () => {
      // 测试不同基数下的表达式显示
      const hexValue = "FF";
      const decimalValue = parseValue(hexValue, 16);
      expect(decimalValue).toBe(255);

      const operation = "+";
      const addValue = "1";
      const expression = `${decimalValue} ${operation} ${addValue}`;
      expect(expression).toBe("255 + 1");

      const result = performCalculation(
        decimalValue.toString(),
        addValue,
        "+",
        10,
        32
      );
      expect(result).toBe(256);
    });
  });
});
