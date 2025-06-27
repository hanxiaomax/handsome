import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type {
  UnitConverterUIState,
  UnitConverterBusinessState,
  ConversionResult,
  CustomConversion,
  UnitConverterEventHandlers,
} from "../../types";
import type { UnitConverterStateActions } from "./useUnitConverterState";
import { UnitConverterEngine } from "../engine";
import { unitCategories } from "../data";
import {
  debounce,
  sortUnitsByRelevance,
  executeCustomFormula,
  copyToClipboard,
} from "../utils";

/**
 * Initial business state for the Unit Converter
 */
const initialBusinessState: UnitConverterBusinessState = {
  isProcessing: false,
  results: [],
  conversionInfo: {
    formula: "",
    explanation: "",
    precision: "",
  },
  customConversions: [],
  error: null,
};

/**
 * Unit Converter Business Logic Hook
 * Handles conversion logic, data processing, and side effects
 */
export function useUnitConverterLogic(
  uiState: UnitConverterUIState,
  uiActions: UnitConverterStateActions
) {
  // Core engine instance
  const engine = useRef(new UnitConverterEngine(unitCategories));

  // Business state
  const [businessState, setBusinessState] =
    useState<UnitConverterBusinessState>(initialBusinessState);

  // Debounced conversion function
  const debouncedConvert = useMemo(
    () =>
      debounce((value: number, unitId: string, categoryId: string) => {
        if (value && unitId && categoryId) {
          setBusinessState((prev) => ({
            ...prev,
            isProcessing: true,
            error: null,
          }));

          try {
            const results = engine.current.convertToAll(
              value,
              unitId,
              categoryId
            );
            const sortedResults = sortUnitsByRelevance(
              results,
              uiState.focusedUnits
            );

            setBusinessState((prev) => ({
              ...prev,
              results: sortedResults,
              isProcessing: false,
            }));
          } catch (error) {
            setBusinessState((prev) => ({
              ...prev,
              error:
                error instanceof Error ? error.message : "Conversion failed",
              isProcessing: false,
            }));
          }
        }
      }, 150),
    [uiState.focusedUnits]
  );

  // Initialize conversions on component mount
  useEffect(() => {
    const initialResults = engine.current.convertToAll(
      uiState.inputValue,
      uiState.inputUnit,
      uiState.selectedCategory
    );
    setBusinessState((prev) => ({ ...prev, results: initialResults }));
  }, []);

  // Re-run conversion when UI state changes
  useEffect(() => {
    debouncedConvert(
      uiState.inputValue,
      uiState.inputUnit,
      uiState.selectedCategory
    );
  }, [
    uiState.inputValue,
    uiState.inputUnit,
    uiState.selectedCategory,
    debouncedConvert,
  ]);

  // Re-sort results when focused units change
  useEffect(() => {
    if (businessState.results.length > 0) {
      const sortedResults = sortUnitsByRelevance(
        businessState.results,
        uiState.focusedUnits
      );
      setBusinessState((prev) => ({ ...prev, results: sortedResults }));
    }
  }, [uiState.focusedUnits, businessState.results]);

  // Computed properties
  const computed = useMemo(
    () => ({
      // Current category data
      selectedCategory: unitCategories.find(
        (c) => c.id === uiState.selectedCategory
      ),

      // Available units for current category
      availableUnits:
        unitCategories
          .find((c) => c.id === uiState.selectedCategory)
          ?.groups.flatMap((g) => g.units) || [],

      // Check if conversion is ready
      canConvert:
        uiState.inputValue > 0 && uiState.inputUnit && uiState.selectedCategory,

      // Check if there are results
      hasResults: businessState.results.length > 0,

      // Get conversion info for current conversion
      currentConversionInfo:
        businessState.results.length > 0
          ? engine.current.getConversionInfo(
              uiState.inputUnit,
              businessState.results[0]?.unit.id || ""
            )
          : businessState.conversionInfo,

      // Always display all results - no filtering
      displayResults: businessState.results,

      // Category options for combobox
      categoryOptions: unitCategories.map((category) => ({
        value: category.id,
        label: category.name,
        icon: category.icon,
      })),
    }),
    [uiState, businessState]
  );

  // Event handlers
  const handlers: UnitConverterEventHandlers = {
    onCategoryChange: useCallback(
      (categoryId: string) => {
        console.log("🔍 Category change requested:", categoryId);

        const category = unitCategories.find((c) => c.id === categoryId);
        console.log("🔍 Found category:", category);

        const firstUnit = category?.groups[0]?.units[0];
        console.log("🔍 First unit:", firstUnit);

        if (firstUnit) {
          // 同步更新状态
          uiActions.initializeForCategory(categoryId, firstUnit.id);
          console.log("🔍 State initialized for category");

          // 立即触发转换，无需setTimeout
          try {
            const results = engine.current.convertToAll(
              1,
              firstUnit.id,
              categoryId
            );
            console.log("🔍 Conversion results:", results);

            const sortedResults = sortUnitsByRelevance(results, []);

            setBusinessState((prev) => ({
              ...prev,
              results: sortedResults,
              isProcessing: false,
              error: null,
            }));

            console.log("✅ Conversion completed successfully");
          } catch (error) {
            console.error("❌ Conversion failed:", error);
            setBusinessState((prev) => ({
              ...prev,
              results: [],
              isProcessing: false,
              error:
                error instanceof Error ? error.message : "Conversion failed",
            }));
          }
        } else {
          console.error("❌ No first unit found for category:", categoryId);
        }
      },
      [uiActions]
    ),

    onInputValueChange: useCallback(
      (value: number) => {
        uiActions.setInputValue(value);
        // Conversion will be triggered by useEffect
      },
      [uiActions]
    ),

    onInputUnitChange: useCallback(
      (unitId: string) => {
        uiActions.setInputUnit(unitId);
        // Conversion will be triggered by useEffect
      },
      [uiActions]
    ),

    onToggleFocus: useCallback(
      (unitId: string) => {
        uiActions.toggleFocusedUnit(unitId);
        const unitName = businessState.results.find((r) => r.unit.id === unitId)
          ?.unit.name;
        const isFocused = uiState.focusedUnits.includes(unitId);

        toast.success(
          isFocused
            ? `Removed ${unitName} from focus`
            : `Focused on ${unitName}`
        );
      },
      [uiActions, businessState.results, uiState.focusedUnits]
    ),

    onCopyValue: useCallback(async (value: string) => {
      const success = await copyToClipboard(value);
      if (success) {
        toast.success("Value copied to clipboard");
      } else {
        toast.error("Failed to copy value");
      }
    }, []),

    onSwapUnits: useCallback(
      (targetUnit: ConversionResult) => {
        const convertedValue = engine.current.convert(
          uiState.inputValue,
          uiState.inputUnit,
          targetUnit.unit.id
        );

        // Update the UI state
        uiActions.updateState({
          inputUnit: targetUnit.unit.id,
          inputValue: convertedValue,
        });

        // Immediately trigger new conversion with the swapped units
        try {
          const newResults = engine.current.convertToAll(
            convertedValue,
            targetUnit.unit.id,
            uiState.selectedCategory
          );
          const sortedResults = sortUnitsByRelevance(
            newResults,
            uiState.focusedUnits
          );

          setBusinessState((prev) => ({
            ...prev,
            results: sortedResults,
            isProcessing: false,
          }));
        } catch (error) {
          setBusinessState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : "Conversion failed",
            isProcessing: false,
          }));
        }

        toast.success(`Swapped to ${targetUnit.unit.name}`);
      },
      [
        uiState.inputValue,
        uiState.inputUnit,
        uiState.selectedCategory,
        uiState.focusedUnits,
        uiActions,
      ]
    ),

    onCalculatorValue: useCallback(
      (value: number) => {
        uiActions.setInputValue(value);
        toast.success(`Value set to ${value}`);
      },
      [uiActions]
    ),

    onCreateCustomConversion: useCallback(() => {
      // This will be handled by the parent component
      console.log("Create custom conversion requested");
    }, []),

    onSaveCustomConversion: useCallback((conversion: CustomConversion) => {
      setBusinessState((prev) => ({
        ...prev,
        customConversions: [...prev.customConversions, conversion],
      }));
      toast.success(`Custom conversion "${conversion.name}" added!`);
    }, []),
  };

  // Additional utility functions
  const utils = {
    /**
     * Execute custom conversion
     */
    executeCustomConversion: useCallback(
      (conversion: CustomConversion, inputValue: number) => {
        return executeCustomFormula(
          conversion.formula,
          inputValue,
          conversion.isJavaScript
        );
      },
      []
    ),

    /**
     * Search units in current category
     */
    searchUnits: useCallback(
      (query: string) => {
        return engine.current.searchUnits(query, uiState.selectedCategory);
      },
      [uiState.selectedCategory]
    ),

    /**
     * Get unit by ID
     */
    getUnit: useCallback((unitId: string) => {
      return engine.current.getUnit(unitId);
    }, []),

    /**
     * Clear all conversions and reset
     */
    clearAll: useCallback(() => {
      uiActions.resetState();
      setBusinessState(initialBusinessState);
      toast.success("Cleared all conversions");
    }, [uiActions]),
  };

  return {
    businessState,
    computed,
    handlers,
    utils,
  };
}

export type UnitConverterLogicHandlers = ReturnType<
  typeof useUnitConverterLogic
>["handlers"];
export type UnitConverterLogicUtils = ReturnType<
  typeof useUnitConverterLogic
>["utils"];
