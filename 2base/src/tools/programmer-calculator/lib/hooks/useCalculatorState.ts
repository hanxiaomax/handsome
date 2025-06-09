import { useState, useCallback } from "react";
import type {
  CalculatorState,
  Base,
  BitWidth,
  CalculatorMode,
  AngleUnit,
  CalculationEntry,
} from "../../types";

const initialState: CalculatorState = {
  currentValue: "0",
  previousValue: "",
  operation: null,
  expression: "",
  base: 10,
  bitWidth: 32,
  mode: "programmer",
  angleUnit: "deg",
  memory: 0,
  history: [],
  isNewNumber: true,
  error: null,
  isAdvancedMode: false,
};

export function useCalculatorState() {
  const [state, setState] = useState<CalculatorState>(initialState);

  const actions = {
    updateState: useCallback((updates: Partial<CalculatorState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    }, []),

    setCurrentValue: useCallback((value: string) => {
      setState((prev) => ({ ...prev, currentValue: value, error: null }));
    }, []),

    setPreviousValue: useCallback((value: string) => {
      setState((prev) => ({ ...prev, previousValue: value }));
    }, []),

    setOperation: useCallback((operation: CalculatorState["operation"]) => {
      setState((prev) => ({ ...prev, operation }));
    }, []),

    setExpression: useCallback((expression: string) => {
      setState((prev) => ({ ...prev, expression }));
    }, []),

    setBase: useCallback((base: Base) => {
      setState((prev) => ({ ...prev, base }));
    }, []),

    setBitWidth: useCallback((bitWidth: BitWidth) => {
      setState((prev) => ({ ...prev, bitWidth }));
    }, []),

    setMode: useCallback((mode: CalculatorMode) => {
      setState((prev) => ({ ...prev, mode }));
    }, []),

    setAngleUnit: useCallback((angleUnit: AngleUnit) => {
      setState((prev) => ({ ...prev, angleUnit }));
    }, []),

    setMemory: useCallback((memory: number) => {
      setState((prev) => ({ ...prev, memory }));
    }, []),

    setHistory: useCallback((history: CalculationEntry[]) => {
      setState((prev) => ({ ...prev, history }));
    }, []),

    setIsNewNumber: useCallback((isNewNumber: boolean) => {
      setState((prev) => ({ ...prev, isNewNumber }));
    }, []),

    setError: useCallback((error: string | null) => {
      setState((prev) => ({ ...prev, error }));
    }, []),

    setAdvancedMode: useCallback((isAdvancedMode: boolean) => {
      setState((prev) => ({ ...prev, isAdvancedMode }));
    }, []),

    clearValues: useCallback(() => {
      setState((prev) => ({
        ...prev,
        currentValue: "0",
        previousValue: "",
        operation: null,
        expression: "",
        isNewNumber: true,
        error: null,
      }));
    }, []),

    reset: useCallback(() => {
      setState(initialState);
    }, []),
  };

  return { state, actions };
}
