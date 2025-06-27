import { useState } from "react";
import type { UnitConverterState } from "../../types";

const initialState: UnitConverterState = {
  selectedCategory: "length",
  inputValue: "1",
  inputUnit: "meter",
  availableUnits: [],
  results: [],
  isProcessing: false,
  error: null,
};

export function useUnitConverterState() {
  const [state, setState] = useState<UnitConverterState>(initialState);

  return {
    state,
    setState,
  };
}
