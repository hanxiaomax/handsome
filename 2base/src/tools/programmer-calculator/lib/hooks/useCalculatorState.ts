import { useState, useCallback } from "react";
import type {
  CalculatorState,
  Base,
  BitWidth,
  CalculatorMode,
  AngleUnit,
} from "../../types";

const initialState: CalculatorState = {
  currentValue: "0",
  previousValue: "",
  operation: null,
  base: 10,
  bitWidth: 32,
  mode: "programmer",
  angleUnit: "deg",
  memory: 0,
  history: [],
  isNewNumber: true,
  error: null,
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

    setIsNewNumber: useCallback((isNewNumber: boolean) => {
      setState((prev) => ({ ...prev, isNewNumber }));
    }, []),

    setError: useCallback((error: string | null) => {
      setState((prev) => ({ ...prev, error }));
    }, []),

    resetState: useCallback(() => {
      setState(initialState);
    }, []),
  };

  return { state, actions };
}
