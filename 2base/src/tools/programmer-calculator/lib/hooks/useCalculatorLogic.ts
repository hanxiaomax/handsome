import { useCallback, useEffect } from "react";
import type {
  CalculatorState,
  ButtonConfig,
  Base,
  BitWidth,
  CalculatorMode,
  AngleUnit,
} from "../../types";
import {
  performCalculation,
  performScientificFunction,
  formatResult,
  validateInput,
} from "../calculator";
import { parseValue, exceedsMaxValue } from "../base-converter";

interface CalculatorActions {
  updateState: (updates: Partial<CalculatorState>) => void;
  setCurrentValue: (value: string) => void;
  setPreviousValue: (value: string) => void;
  setOperation: (operation: CalculatorState["operation"]) => void;
  setExpression: (expression: string) => void;
  setBase: (base: Base) => void;
  setBitWidth: (bitWidth: BitWidth) => void;
  setMode: (mode: CalculatorMode) => void;
  setAngleUnit: (angleUnit: AngleUnit) => void;
  setMemory: (memory: number) => void;
  setIsNewNumber: (isNewNumber: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
  clearValues: () => void;
}

// 辅助函数：格式化操作符用于显示
const formatOperatorForDisplay = (op: string): string => {
  switch (op) {
    case "&":
      return " & ";
    case "|":
      return " | ";
    case "^":
      return " ^ ";
    case "<<":
      return " << ";
    case ">>":
      return " >> ";
    case "+":
      return " + ";
    case "-":
      return " - ";
    case "*":
      return " * ";
    case "/":
      return " / ";
    case "%":
      return " % ";
    default:
      return ` ${op} `;
  }
};

// 辅助函数：更新表达式显示
const updateExpression = (
  currentValue: string,
  previousValue: string,
  operation: string | null,
  actions: CalculatorActions
) => {
  if (!operation) {
    actions.setExpression(currentValue);
  } else if (previousValue) {
    actions.setExpression(
      `${previousValue}${formatOperatorForDisplay(operation)}${currentValue}`
    );
  } else {
    actions.setExpression(currentValue);
  }
};

export function useCalculatorLogic(
  state: CalculatorState,
  actions: CalculatorActions
) {
  const handleButtonClick = useCallback(
    (value: string, type: ButtonConfig["type"]) => {
      try {
        actions.setError(null);

        switch (type) {
          case "number": {
            // Handle special number cases
            if (value === "00") {
              // Handle double zero
              const newValue =
                state.isNewNumber || state.currentValue === "0"
                  ? "0"
                  : state.currentValue + "00";

              try {
                const numericValue = parseValue(newValue, state.base);
                if (exceedsMaxValue(numericValue, state.bitWidth)) {
                  return;
                }
                actions.setCurrentValue(newValue);
                if (state.isNewNumber) {
                  actions.setIsNewNumber(false);
                }
                // 更新表达式显示
                updateExpression(
                  newValue,
                  state.previousValue,
                  state.operation,
                  actions
                );
              } catch {
                return;
              }
              break;
            }

            // Silently ignore invalid input instead of showing error
            if (!validateInput(value, state.base)) {
              return;
            }

            let newValue: string;
            if (state.isNewNumber) {
              newValue = value === "0" ? "0" : value;
            } else {
              newValue =
                state.currentValue === "0" ? value : state.currentValue + value;
            }

            // Check if the new value exceeds the maximum for current bit width
            try {
              const numericValue = parseValue(newValue, state.base);
              if (exceedsMaxValue(numericValue, state.bitWidth)) {
                // Silently ignore input that exceeds maximum
                return;
              }
            } catch {
              // Silently ignore invalid number format
              return;
            }

            actions.setCurrentValue(newValue);
            if (state.isNewNumber) {
              actions.setIsNewNumber(false);
            }
            // 更新表达式显示
            updateExpression(
              newValue,
              state.previousValue,
              state.operation,
              actions
            );
            break;
          }

          case "operation":
            if (value === "=") {
              // 只有在按等号时才计算结果
              if (state.operation && state.previousValue) {
                const result = performCalculation(
                  state.previousValue,
                  state.currentValue,
                  state.operation,
                  state.base,
                  state.bitWidth
                );
                const formattedResult = formatResult(result, state.base);
                actions.setCurrentValue(formattedResult);
                actions.setPreviousValue("");
                actions.setOperation(null);
                actions.setIsNewNumber(true);
                // 显示计算结果，清除表达式
                actions.setExpression(formattedResult);
              }
            } else {
              // 其他操作符：不立即计算，只更新状态和表达式
              if (
                state.operation &&
                state.previousValue &&
                !state.isNewNumber
              ) {
                // 如果有待计算的操作，先完成它（连续运算）
                const result = performCalculation(
                  state.previousValue,
                  state.currentValue,
                  state.operation,
                  state.base,
                  state.bitWidth
                );
                const formattedResult = formatResult(result, state.base);
                actions.setCurrentValue(formattedResult);
                actions.setPreviousValue(formattedResult);
                actions.setOperation(value as CalculatorState["operation"]);
                actions.setIsNewNumber(true);
                // 更新表达式显示新的操作
                actions.setExpression(
                  `${formattedResult}${formatOperatorForDisplay(value)}`
                );
              } else {
                // 首次输入操作符或新的操作
                actions.setPreviousValue(state.currentValue);
                actions.setOperation(value as CalculatorState["operation"]);
                actions.setIsNewNumber(true);
                // 显示当前表达式
                actions.setExpression(
                  `${state.currentValue}${formatOperatorForDisplay(value)}`
                );
              }
            }
            break;

          case "function": {
            // Handle bitwise operations as unary or binary operations
            switch (value) {
              case "~": {
                // NOT operation (unary) - 立即计算
                const notResult = performCalculation(
                  "0",
                  state.currentValue,
                  "~",
                  state.base,
                  state.bitWidth
                );
                const formattedResult = formatResult(notResult, state.base);
                actions.setCurrentValue(formattedResult);
                actions.setIsNewNumber(true);
                // 显示一元操作表达式
                actions.setExpression(
                  `~${state.currentValue} = ${formattedResult}`
                );
                break;
              }
              case "&":
              case "|":
              case "^":
              case "<<":
              case ">>": {
                // Binary operations - 准备第二个操作数（不立即计算）
                if (
                  state.operation &&
                  state.previousValue &&
                  !state.isNewNumber
                ) {
                  // Complete previous operation first
                  const result = performCalculation(
                    state.previousValue,
                    state.currentValue,
                    state.operation,
                    state.base,
                    state.bitWidth
                  );
                  const formattedResult = formatResult(result, state.base);
                  actions.setCurrentValue(formattedResult);
                  actions.setPreviousValue(formattedResult);
                  actions.setOperation(value as CalculatorState["operation"]);
                  actions.setIsNewNumber(true);
                  // 更新表达式显示
                  actions.setExpression(
                    `${formattedResult}${formatOperatorForDisplay(value)}`
                  );
                } else {
                  actions.setPreviousValue(state.currentValue);
                  actions.setOperation(value as CalculatorState["operation"]);
                  actions.setIsNewNumber(true);
                  // 显示当前表达式
                  actions.setExpression(
                    `${state.currentValue}${formatOperatorForDisplay(value)}`
                  );
                }
                break;
              }
              default: {
                // Handle other scientific functions if needed - 立即计算
                const result = performScientificFunction(
                  state.currentValue,
                  value,
                  state.base,
                  state.angleUnit
                );
                const formattedResult = formatResult(result, state.base);
                actions.setCurrentValue(formattedResult);
                actions.setIsNewNumber(true);
                // 显示函数表达式
                actions.setExpression(
                  `${value}(${state.currentValue}) = ${formattedResult}`
                );
                break;
              }
            }
            break;
          }

          case "special":
            switch (value) {
              case "clear":
                actions.clearValues();
                break;
              case "backspace":
                if (state.currentValue.length > 1) {
                  const newValue = state.currentValue.slice(0, -1);
                  actions.setCurrentValue(newValue);
                  // 更新表达式显示
                  updateExpression(
                    newValue,
                    state.previousValue,
                    state.operation,
                    actions
                  );
                } else {
                  actions.setCurrentValue("0");
                  actions.setIsNewNumber(true);
                  // 更新表达式显示
                  updateExpression(
                    "0",
                    state.previousValue,
                    state.operation,
                    actions
                  );
                }
                break;
              case "(":
              case ")":
                // Parentheses are not implemented yet
                // Silently ignore for now
                break;
              case "memory-add":
                actions.setMemory(
                  state.memory + parseValue(state.currentValue, state.base)
                );
                break;
              case "memory-subtract":
                actions.setMemory(
                  state.memory - parseValue(state.currentValue, state.base)
                );
                break;
              case "memory-recall": {
                const memoryValue = formatResult(state.memory, state.base);
                actions.setCurrentValue(memoryValue);
                actions.setIsNewNumber(true);
                // 显示内存召回
                actions.setExpression(`MR = ${memoryValue}`);
                break;
              }
              case "memory-clear":
                actions.setMemory(0);
                break;
            }
            break;
        }
      } catch (error) {
        actions.setError(
          error instanceof Error ? error.message : "Calculation error"
        );
      }
    },
    [state, actions]
  );

  const handleBaseChange = useCallback(
    (newBase: Base) => {
      try {
        const decimal = parseValue(state.currentValue, state.base);
        const newValue = formatResult(decimal, newBase);
        actions.setBase(newBase);
        actions.setCurrentValue(newValue);
        actions.setError(null);
        // 基数改变时更新表达式显示
        updateExpression(
          newValue,
          state.previousValue,
          state.operation,
          actions
        );
      } catch {
        // Silently reset to "0" if base conversion fails
        actions.setBase(newBase);
        actions.setCurrentValue("0");
        actions.setError(null);
        actions.setExpression("0");
      }
    },
    [
      state.currentValue,
      state.base,
      state.previousValue,
      state.operation,
      actions,
    ]
  );

  const handleBitWidthChange = useCallback(
    (newBitWidth: BitWidth) => {
      actions.setBitWidth(newBitWidth);
    },
    [actions]
  );

  const handleModeChange = useCallback(
    (newMode: CalculatorMode) => {
      actions.setMode(newMode);
    },
    [actions]
  );

  const handleAngleUnitChange = useCallback(
    (newUnit: AngleUnit) => {
      actions.setAngleUnit(newUnit);
    },
    [actions]
  );

  const handleBitValueChange = useCallback(
    (newValue: string) => {
      actions.setCurrentValue(newValue);
      actions.setIsNewNumber(false);
      actions.setError(null);
      // 位值改变时更新表达式显示
      updateExpression(newValue, state.previousValue, state.operation, actions);
    },
    [state.previousValue, state.operation, actions]
  );

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey } = event;

      // Prevent default for calculator keys (but allow Tab for navigation)
      if (
        /[0-9A-Fa-f+\-*/%&|^~()=]/.test(key) ||
        key === "Enter" ||
        key === "Escape" ||
        key === "Backspace"
      ) {
        event.preventDefault();
      }

      // Allow Tab key for normal navigation
      if (key === "Tab") {
        return; // Don't handle Tab, let browser handle navigation
      }

      // Base switching shortcuts
      if (ctrlKey) {
        switch (key) {
          case "1":
            handleBaseChange(2);
            return;
          case "2":
            handleBaseChange(8);
            return;
          case "3":
            handleBaseChange(10);
            return;
          case "4":
            handleBaseChange(16);
            return;
        }
      }

      // Handle key input
      if (/[0-9A-Fa-f]/.test(key)) {
        handleButtonClick(key.toUpperCase(), "number");
      } else {
        switch (key) {
          case "+":
          case "-":
          case "*":
          case "/":
          case "%":
          case "&":
          case "|":
          case "^":
          case "~":
            handleButtonClick(key, "operation");
            break;
          case "Enter":
          case "=":
            handleButtonClick("=", "operation");
            break;
          case "Escape":
            handleButtonClick("clear", "special");
            break;
          case "Backspace":
            handleButtonClick("backspace", "special");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.base, handleBaseChange, handleButtonClick]);

  const handlers = {
    onButtonClick: handleButtonClick,
    onBaseChange: handleBaseChange,
    onBitWidthChange: handleBitWidthChange,
    onModeChange: handleModeChange,
    onAngleUnitChange: handleAngleUnitChange,
    onBitValueChange: handleBitValueChange,
  };

  return { handlers };
}
