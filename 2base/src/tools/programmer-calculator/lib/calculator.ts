import type { Operation, Base, BitWidth, AngleUnit } from "../types";
import { parseValue, applyBitWidth } from "./base-converter";
import {
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
} from "./bitwise";

export function performCalculation(
  previousValue: string,
  currentValue: string,
  operation: Operation,
  base: Base,
  bitWidth: BitWidth
): number {
  if (!operation || operation === "=") {
    return parseValue(currentValue, base);
  }

  const prev = parseValue(previousValue, base);
  const curr = parseValue(currentValue, base);

  let result: number;

  switch (operation) {
    case "+":
      result = prev + curr;
      break;
    case "-":
      result = prev - curr;
      break;
    case "*":
      result = prev * curr;
      break;
    case "/":
      if (curr === 0) throw new Error("Division by zero");
      result = Math.floor(prev / curr);
      break;
    case "%":
      if (curr === 0) throw new Error("Division by zero");
      result = prev % curr;
      break;
    case "&":
      result = bitwiseAnd(prev, curr, bitWidth);
      break;
    case "|":
      result = bitwiseOr(prev, curr, bitWidth);
      break;
    case "^":
      result = bitwiseXor(prev, curr, bitWidth);
      break;
    case "<<":
      result = leftShift(prev, curr, bitWidth);
      break;
    case ">>":
      result = rightShift(prev, curr, bitWidth);
      break;
    case "~":
      // bitwiseNot已经处理了位宽约束，不需要再次应用
      return bitwiseNot(prev, bitWidth);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return applyBitWidth(result, bitWidth);
}

export function performScientificFunction(
  value: string,
  func: string,
  base: Base,
  angleUnit: AngleUnit = "deg"
): number {
  const num = parseValue(value, base);

  switch (func) {
    case "sin":
      return Math.sin(angleUnit === "deg" ? (num * Math.PI) / 180 : num);
    case "cos":
      return Math.cos(angleUnit === "deg" ? (num * Math.PI) / 180 : num);
    case "tan":
      return Math.tan(angleUnit === "deg" ? (num * Math.PI) / 180 : num);
    case "log":
      if (num <= 0) throw new Error("Logarithm of non-positive number");
      return Math.log10(num);
    case "ln":
      if (num <= 0) throw new Error("Natural logarithm of non-positive number");
      return Math.log(num);
    case "sqrt":
      if (num < 0) throw new Error("Square root of negative number");
      return Math.sqrt(num);
    case "square":
      return num * num;
    case "cube":
      return num * num * num;
    case "factorial":
      if (num < 0 || !Number.isInteger(num))
        throw new Error("Factorial of non-integer or negative number");
      return factorial(num);
    case "abs":
      return Math.abs(num);
    case "negate":
      return -num;
    default:
      throw new Error(`Unknown function: ${func}`);
  }
}

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  if (n > 20) throw new Error("Factorial too large");

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function validateInput(input: string, base: Base): boolean {
  if (!input) return true;

  const validChars = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9A-Fa-f]+$/,
  };

  return validChars[base].test(input);
}

export function formatResult(value: number, base: Base): string {
  if (isNaN(value) || !isFinite(value)) {
    return "Error";
  }

  const intValue = Math.floor(Math.abs(value));
  const result = intValue.toString(base).toUpperCase();

  return value < 0 ? `-${result}` : result;
}
