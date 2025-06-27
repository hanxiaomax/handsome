import { useState } from "react";
import type { UnitConverterState } from "../../types";

const initialState: UnitConverterState = {
  selectedCategory: "",
  inputValue: "1",
  inputUnit: "",
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
