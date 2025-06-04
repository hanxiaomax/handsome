import { useState, useCallback } from "react";
import type { UnitConverterUIState } from "../../types";

/**
 * Initial UI state for the Unit Converter
 */
const initialUIState: UnitConverterUIState = {
  selectedCategory: "length",
  inputValue: 1,
  inputUnit: "meter",
  showAllUnits: false,
  compactMode: false,
  focusedUnits: [], // Units that user wants to highlight
  searchQuery: "",
};

/**
 * Unit Converter State Management Hook
 * Manages UI state and provides actions to update it
 */
export function useUnitConverterState() {
  const [state, setState] = useState<UnitConverterUIState>(initialUIState);

  // UI Actions
  const actions = {
    /**
     * Set the selected category
     */
    setSelectedCategory: useCallback((categoryId: string) => {
      setState((prev) => ({
        ...prev,
        selectedCategory: categoryId,
        // Reset focused units when switching categories
        focusedUnits: [],
      }));
    }, []),

    /**
     * Set the input value
     */
    setInputValue: useCallback((value: number) => {
      setState((prev) => ({ ...prev, inputValue: value }));
    }, []),

    /**
     * Set the input unit
     */
    setInputUnit: useCallback((unitId: string) => {
      setState((prev) => ({ ...prev, inputUnit: unitId }));
    }, []),

    /**
     * Toggle show all units display
     */
    setShowAllUnits: useCallback((show: boolean) => {
      setState((prev) => ({ ...prev, showAllUnits: show }));
    }, []),

    /**
     * Toggle compact mode
     */
    setCompactMode: useCallback((compact: boolean) => {
      setState((prev) => ({ ...prev, compactMode: compact }));
    }, []),

    /**
     * Toggle focus on a specific unit
     */
    toggleFocusedUnit: useCallback((unitId: string) => {
      setState((prev) => {
        const isFocused = prev.focusedUnits.includes(unitId);
        const newFocused = isFocused
          ? prev.focusedUnits.filter((id) => id !== unitId)
          : [unitId, ...prev.focusedUnits]; // Add to beginning

        return { ...prev, focusedUnits: newFocused };
      });
    }, []),

    /**
     * Set search query
     */
    setSearchQuery: useCallback((query: string) => {
      setState((prev) => ({ ...prev, searchQuery: query }));
    }, []),

    /**
     * Reset all state to initial values
     */
    resetState: useCallback(() => {
      setState(initialUIState);
    }, []),

    /**
     * Set multiple state properties at once
     */
    updateState: useCallback((updates: Partial<UnitConverterUIState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    }, []),

    /**
     * Initialize state from category (used when switching categories)
     */
    initializeForCategory: useCallback(
      (categoryId: string, defaultUnit: string) => {
        setState((prev) => ({
          ...prev,
          selectedCategory: categoryId,
          inputUnit: defaultUnit,
          inputValue: 1,
          focusedUnits: [],
          searchQuery: "",
        }));
      },
      []
    ),
  };

  // Computed properties
  const computed = {
    /**
     * Check if any units are focused
     */
    hasFocusedUnits: state.focusedUnits.length > 0,

    /**
     * Check if search is active
     */
    isSearching: state.searchQuery.trim().length > 0,

    /**
     * Get focused units array
     */
    focusedUnits: state.focusedUnits,

    /**
     * Check if a specific unit is focused
     */
    isUnitFocused: (unitId: string) => state.focusedUnits.includes(unitId),
  };

  return {
    state,
    actions,
    computed,
  };
}

export type UnitConverterStateActions = ReturnType<
  typeof useUnitConverterState
>["actions"];
export type UnitConverterStateComputed = ReturnType<
  typeof useUnitConverterState
>["computed"];
