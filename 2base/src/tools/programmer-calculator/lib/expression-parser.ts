import type { Base, BitWidth, Operation } from "../types";
import { parseValue } from "./base-converter";
import { performCalculation } from "./calculator";

export interface ParsedExpression {
  tokens: Array<{
    type: "operand" | "operator";
    value: string;
    numericValue?: number;
  }>;
  isValid: boolean;
  error?: string;
  operationType: "arithmetic" | "bitwise" | "mixed" | "none";
}

export interface ExpressionResult {
  steps: Array<{
    operand1: number;
    operator: string;
    operand2?: number;
    result: number;
    expression: string;
  }>;
  finalResult: number;
  isValid: boolean;
  error?: string;
}

// Define operation types
const ARITHMETIC_OPS = ["+", "-", "*", "/", "%"];
const BITWISE_OPS = ["&", "|", "^", "~", "<<", ">>"];
const ALL_OPS = [...ARITHMETIC_OPS, ...BITWISE_OPS];

/**
 * Tokenize the input expression
 */
export function tokenizeExpression(input: string): string[] {
  // Handle multi-character operators first
  const processed = input
    .replace(/<<|>>/g, (match) => ` ${match} `)
    .replace(/[&|^~+\-*/%()]/g, (match) => ` ${match} `)
    .replace(/\s+/g, " ")
    .trim();

  return processed.split(" ").filter((token) => token.length > 0);
}

/**
 * Parse expression into structured format
 */
export function parseExpression(
  input: string,
  base: Base = 10
): ParsedExpression {
  if (!input.trim()) {
    return {
      tokens: [],
      isValid: false,
      error: "Empty expression",
      operationType: "none",
    };
  }

  // Handle special commands
  if (input.toLowerCase().trim() === "help") {
    return {
      tokens: [],
      isValid: false,
      error: "Help requested",
      operationType: "none",
    };
  }

  const tokens = tokenizeExpression(input);
  const parsedTokens: ParsedExpression["tokens"] = [];
  const operators: string[] = [];
  let operationType: ParsedExpression["operationType"] = "none";

  try {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (ALL_OPS.includes(token)) {
        // It's an operator
        operators.push(token);
        parsedTokens.push({
          type: "operator",
          value: token,
        });

        // Determine operation type
        if (ARITHMETIC_OPS.includes(token)) {
          if (operationType === "none") {
            operationType = "arithmetic";
          } else if (operationType === "bitwise") {
            operationType = "mixed";
          }
        } else if (BITWISE_OPS.includes(token)) {
          if (operationType === "none") {
            operationType = "bitwise";
          } else if (operationType === "arithmetic") {
            operationType = "mixed";
          }
        }
      } else {
        // It's an operand
        try {
          const numericValue = parseValue(token, base);
          parsedTokens.push({
            type: "operand",
            value: token,
            numericValue,
          });
        } catch {
          return {
            tokens: [],
            isValid: false,
            error: `Invalid operand: ${token}`,
            operationType: "none",
          };
        }
      }
    }

    // Validate expression structure
    if (parsedTokens.length === 0) {
      return {
        tokens: [],
        isValid: false,
        error: "No valid tokens found",
        operationType: "none",
      };
    }

    // Check for mixed operations
    if (operationType === "mixed") {
      return {
        tokens: parsedTokens,
        isValid: false,
        error: "Cannot mix arithmetic and bitwise operations",
        operationType,
      };
    }

    // Validate token sequence (should alternate operand-operator-operand...)
    for (let i = 0; i < parsedTokens.length; i++) {
      const expectedType = i % 2 === 0 ? "operand" : "operator";
      if (parsedTokens[i].type !== expectedType) {
        return {
          tokens: parsedTokens,
          isValid: false,
          error: `Invalid expression structure at position ${i + 1}`,
          operationType,
        };
      }
    }

    // Must start and end with operand
    if (
      parsedTokens[0].type !== "operand" ||
      parsedTokens[parsedTokens.length - 1].type !== "operand"
    ) {
      return {
        tokens: parsedTokens,
        isValid: false,
        error: "Expression must start and end with operands",
        operationType,
      };
    }

    return {
      tokens: parsedTokens,
      isValid: true,
      operationType,
    };
  } catch (error) {
    return {
      tokens: [],
      isValid: false,
      error: error instanceof Error ? error.message : "Parse error",
      operationType: "none",
    };
  }
}

/**
 * Evaluate parsed expression step by step
 */
export function evaluateExpression(
  parsed: ParsedExpression,
  base: Base = 10,
  bitWidth: BitWidth = 32
): ExpressionResult {
  if (!parsed.isValid || parsed.tokens.length === 0) {
    return {
      steps: [],
      finalResult: 0,
      isValid: false,
      error: parsed.error || "Invalid expression",
    };
  }

  const steps: ExpressionResult["steps"] = [];
  let currentResult = parsed.tokens[0].numericValue!;

  try {
    // Process each operator-operand pair
    for (let i = 1; i < parsed.tokens.length; i += 2) {
      const operator = parsed.tokens[i];
      const operand = parsed.tokens[i + 1];

      if (operator.type !== "operator" || operand.type !== "operand") {
        throw new Error("Invalid expression structure");
      }

      const previousResult = currentResult;
      currentResult = performCalculation(
        currentResult.toString(),
        operand.value,
        operator.value as Operation,
        base,
        bitWidth
      );

      // Build expression string for this step
      const stepExpression =
        i === 1
          ? `${parsed.tokens[0].value} ${operator.value} ${operand.value}`
          : `${previousResult} ${operator.value} ${operand.value}`;

      steps.push({
        operand1: previousResult,
        operator: operator.value,
        operand2: operand.numericValue!,
        result: currentResult,
        expression: stepExpression,
      });
    }

    return {
      steps,
      finalResult: currentResult,
      isValid: true,
    };
  } catch (error) {
    return {
      steps,
      finalResult: 0,
      isValid: false,
      error: error instanceof Error ? error.message : "Evaluation error",
    };
  }
}

/**
 * Parse and evaluate expression in one step
 */
export function processExpression(
  input: string,
  base: Base = 10,
  bitWidth: BitWidth = 32
): { parsed: ParsedExpression; result: ExpressionResult } {
  const parsed = parseExpression(input, base);
  const result = evaluateExpression(parsed, base, bitWidth);

  return { parsed, result };
}

/**
 * Get expression examples for help
 */
export function getExpressionExamples(): string[] {
  return [
    "15 & 7 | 3",
    "23 | 45",
    "~42",
    "8 << 2",
    "100 + 50 - 25",
    "5 * 3 + 2",
    "255 & 128 | 64",
  ];
}
