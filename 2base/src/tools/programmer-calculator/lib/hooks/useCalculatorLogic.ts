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
            break;
          }

          case "operation":
            if (value === "=") {
              if (state.operation && state.previousValue) {
                const result = performCalculation(
                  state.previousValue,
                  state.currentValue,
                  state.operation,
                  state.base,
                  state.bitWidth
                );
                actions.setCurrentValue(formatResult(result, state.base));
                actions.setPreviousValue("");
                actions.setOperation(null);
                actions.setIsNewNumber(true);
              }
            } else {
              if (
                state.operation &&
                state.previousValue &&
                !state.isNewNumber
              ) {
                const result = performCalculation(
                  state.previousValue,
                  state.currentValue,
                  state.operation,
                  state.base,
                  state.bitWidth
                );
                actions.setCurrentValue(formatResult(result, state.base));
              }
              actions.setPreviousValue(state.currentValue);
              actions.setOperation(value as CalculatorState["operation"]);
              actions.setIsNewNumber(true);
            }
            break;

          case "function": {
            const result = performScientificFunction(
              state.currentValue,
              value,
              state.base,
              state.angleUnit
            );
            actions.setCurrentValue(formatResult(result, state.base));
            actions.setIsNewNumber(true);
            break;
          }

          case "special":
            switch (value) {
              case "clear":
                actions.clearValues();
                break;
              case "backspace":
                if (state.currentValue.length > 1) {
                  actions.setCurrentValue(state.currentValue.slice(0, -1));
                } else {
                  actions.setCurrentValue("0");
                  actions.setIsNewNumber(true);
                }
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
              case "memory-recall":
                actions.setCurrentValue(formatResult(state.memory, state.base));
                actions.setIsNewNumber(true);
                break;
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
      } catch {
        // Silently reset to "0" if base conversion fails
        actions.setBase(newBase);
        actions.setCurrentValue("0");
        actions.setError(null);
      }
    },
    [state.currentValue, state.base, actions]
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
    },
    [actions]
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
