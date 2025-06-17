"use client";

import { useCallback, useEffect, useRef } from "react";
import { Toaster } from "sonner";

// Types and Logic from programmer-calculator
import type {
  Base,
  BitWidth,
  Operation,
} from "@/tools/programmer-calculator/types";
import { useCalculatorState } from "@/tools/programmer-calculator/lib/hooks/useCalculatorState";
import { useCalculatorLogic } from "@/tools/programmer-calculator/lib/hooks/useCalculatorLogic";
import {
  parseValue,
  formatForBase,
} from "@/tools/programmer-calculator/lib/base-converter";
import { toggleBit } from "@/tools/programmer-calculator/lib/bitwise";

// Store hooks (always called)
import {
  useCalculatorSnapshot,
  useCalculatorActions,
} from "@/tools/programmer-calculator/lib/store";

// Components from programmer-calculator
import {
  MainDisplayArea,
  BitVisualization,
  ControlBar,
  CalculatorGrid,
  StatusBar,
} from "@/tools/programmer-calculator/components";

interface ProgrammerCalProps {
  // Layout options
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";

  // Feature toggles
  showToaster?: boolean;
  hideBitVisualization?: boolean; // 隐藏位可视化组件

  // Force mode selection (optional)
  forceLocalState?: boolean; // 强制使用本地状态
  forceStoreState?: boolean; // 强制使用store状态

  // Controlled/Uncontrolled mode (legacy support)
  controlled?: boolean;

  // Controlled mode props - external state
  value?: string;
  base?: Base;
  bitWidth?: BitWidth;
  previousValue?: string;
  operation?: Operation | null;

  // External value sync (for uncontrolled mode)
  externalValue?: string;
  externalBase?: Base;
  externalBitWidth?: BitWidth;

  // Initial values (for uncontrolled mode)
  initialBase?: Base;
  initialBitWidth?: BitWidth;
  initialValue?: string;

  // Event handlers
  onValueChange?: (value: string, base: Base) => void;
  onOperationComplete?: (expression: string, result: string) => void;
  onBaseChange?: (base: Base) => void;
  onBitWidthChange?: (bitWidth: BitWidth) => void;
  onButtonClick?: (
    value: string,
    type: "number" | "operation" | "function" | "special"
  ) => void;
  onStateChange?: (state: {
    currentValue: string;
    previousValue: string;
    operation: Operation | null;
    base: Base;
    bitWidth: BitWidth;
  }) => void;

  // Styling options
  compact?: boolean;
  borderless?: boolean;
}

/**
 * ProgrammerCal - Unified Programmer Calculator Component
 *
 * Automatically detects and uses the appropriate state management:
 * - If Zustand store is available and not forced to local state -> uses store
 * - Otherwise -> uses local state management
 *
 * @example
 * // Auto-detection mode (recommended)
 * <ProgrammerCal />
 *
 * @example
 * // Force local state
 * <ProgrammerCal forceLocalState={true} />
 *
 * @example
 * // Force store state
 * <ProgrammerCal forceStoreState={true} />
 */
export function ProgrammerCal({
  className = "",
  maxWidth = "full",
  showToaster = true,
  hideBitVisualization = false,
  forceLocalState = false,
  forceStoreState = false,
  controlled = false,
  // Controlled mode props
  value,
  base,
  bitWidth,
  previousValue,
  operation,
  // External value sync (for uncontrolled mode)
  externalValue,
  externalBase,
  externalBitWidth,
  // Uncontrolled mode props
  initialBase = 10,
  initialBitWidth = 32,
  initialValue = "0",
  // Event handlers
  onValueChange,
  onOperationComplete,
  onBaseChange,
  onBitWidthChange,
  onButtonClick,
  onStateChange,
  compact = false,
  borderless = false,
}: ProgrammerCalProps) {
  // Always call all hooks (React rules)
  const { state: localState, actions: localActions } = useCalculatorState();
  const { handlers: localHandlers } = useCalculatorLogic(
    localState,
    localActions
  );

  // Always call store hooks, but handle errors gracefully
  let storeSnapshot = null;
  let storeActions = null;
  let storeAvailable = false;

  // Always call hooks, but catch errors
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeSnapshot = useCalculatorSnapshot();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    storeActions = useCalculatorActions();
    storeAvailable = !!(storeSnapshot && storeActions);
  } catch {
    // Store not available, will use local state
    storeAvailable = false;
  }

  // Determine which state management to use
  const shouldUseStore = useCallback(() => {
    if (forceLocalState) return false;
    if (forceStoreState) return true;
    if (controlled) return false; // 受控模式使用本地状态
    return storeAvailable;
  }, [forceLocalState, forceStoreState, controlled, storeAvailable]);

  const usingStore = shouldUseStore();

  // Track external updates to avoid triggering callbacks
  const isExternalUpdate = useRef(false);

  // Determine which state and actions to use
  const currentState =
    usingStore && storeSnapshot
      ? {
          currentValue: storeSnapshot.currentValue,
          previousValue: storeSnapshot.previousValue,
          operation: storeSnapshot.operation,
          base: storeSnapshot.base,
          bitWidth: storeSnapshot.bitWidth,
          expression: "", // Store doesn't have expression, use empty
          mode: "programmer" as const,
          angleUnit: "deg" as const,
          memory: 0,
          history: [],
          isNewNumber: true,
          error: null,
          isAdvancedMode: false,
        }
      : localState;

  const currentActions =
    usingStore && storeActions
      ? {
          setCurrentValue: (value: string) =>
            storeActions.setValue(value, "calculator"),
          setBase: (base: Base) => storeActions.setBase(base, "calculator"),
          setBitWidth: (bitWidth: BitWidth) =>
            storeActions.setBitWidth(bitWidth, "calculator"),
          setPreviousValue: (value: string) =>
            storeActions.setPreviousValue(value, "calculator"),
          setOperation: (operation: Operation | null) =>
            storeActions.setOperation(operation, "calculator"),
          clearValues: () => {
            storeActions.setValue("0", "calculator");
            storeActions.setPreviousValue("", "calculator");
            storeActions.setOperation(null, "calculator");
          },
        }
      : localActions;

  // Initialize state for uncontrolled mode
  useEffect(() => {
    if (!controlled && !usingStore) {
      if (initialBase !== 10 && currentState.base === 10)
        currentActions.setBase(initialBase);
      if (initialBitWidth !== 32 && currentState.bitWidth === 32)
        currentActions.setBitWidth(initialBitWidth);
      if (initialValue !== "0" && currentState.currentValue === "0")
        currentActions.setCurrentValue(initialValue);
    }
  }, [
    controlled,
    usingStore,
    initialBase,
    initialBitWidth,
    initialValue,
    currentActions,
    currentState.base,
    currentState.bitWidth,
    currentState.currentValue,
  ]);

  // Sync external state for controlled mode
  useEffect(() => {
    if (controlled) {
      if (value !== undefined && value !== currentState.currentValue) {
        currentActions.setCurrentValue(value);
      }
      if (base !== undefined && base !== currentState.base) {
        currentActions.setBase(base);
      }
      if (bitWidth !== undefined && bitWidth !== currentState.bitWidth) {
        currentActions.setBitWidth(bitWidth);
      }
      if (
        previousValue !== undefined &&
        previousValue !== currentState.previousValue
      ) {
        currentActions.setPreviousValue(previousValue);
      }
      if (operation !== undefined && operation !== currentState.operation) {
        currentActions.setOperation(operation);
      }
    }
  }, [
    controlled,
    value,
    base,
    bitWidth,
    previousValue,
    operation,
    currentState,
    currentActions,
  ]);

  // Sync external values for uncontrolled mode (for external updates like bit clicks)
  useEffect(() => {
    if (!controlled && !usingStore) {
      let hasExternalUpdate = false;

      if (
        externalValue !== undefined &&
        externalValue !== currentState.currentValue
      ) {
        isExternalUpdate.current = true;
        currentActions.setCurrentValue(externalValue);
        hasExternalUpdate = true;
      }
      if (externalBase !== undefined && externalBase !== currentState.base) {
        isExternalUpdate.current = true;
        currentActions.setBase(externalBase);
        hasExternalUpdate = true;
      }
      if (
        externalBitWidth !== undefined &&
        externalBitWidth !== currentState.bitWidth
      ) {
        isExternalUpdate.current = true;
        currentActions.setBitWidth(externalBitWidth);
        hasExternalUpdate = true;
      }

      // Reset flag after external update
      if (hasExternalUpdate) {
        setTimeout(() => {
          isExternalUpdate.current = false;
        }, 0);
      }
    }
  }, [
    controlled,
    usingStore,
    externalValue,
    externalBase,
    externalBitWidth,
    currentState.currentValue,
    currentState.base,
    currentState.bitWidth,
    currentActions,
  ]);

  // Get current effective values (controlled or internal state)
  const currentValue = controlled ? value || "0" : currentState.currentValue;
  const currentBase = controlled ? base || 10 : currentState.base;
  const currentBitWidth = controlled ? bitWidth || 32 : currentState.bitWidth;
  const currentPreviousValue = controlled
    ? previousValue || ""
    : currentState.previousValue;
  const currentOperation = controlled ? operation : currentState.operation;

  // Enhanced event handlers with callbacks
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!controlled) {
        currentActions.setCurrentValue(newValue);
      }
      onValueChange?.(newValue, currentBase);
    },
    [controlled, currentActions, onValueChange, currentBase]
  );

  const handleBaseChange = useCallback(
    (newBase: Base) => {
      try {
        const decimal = parseValue(
          currentValue || "0",
          currentBase,
          currentBitWidth
        );
        const newValue = formatForBase(decimal.toString(), newBase);

        if (!controlled) {
          currentActions.setBase(newBase);
          currentActions.setCurrentValue(newValue);
        }

        onBaseChange?.(newBase);
        onValueChange?.(newValue, newBase);
      } catch {
        if (!controlled) {
          currentActions.setBase(newBase);
          currentActions.setCurrentValue("0");
        }
        onBaseChange?.(newBase);
        onValueChange?.("0", newBase);
      }
    },
    [
      controlled,
      currentValue,
      currentBase,
      currentBitWidth,
      currentActions,
      onBaseChange,
      onValueChange,
    ]
  );

  const handleBitWidthChange = useCallback(
    (newBitWidth: BitWidth) => {
      if (!controlled) {
        currentActions.setBitWidth(newBitWidth);
      }
      onBitWidthChange?.(newBitWidth);
    },
    [controlled, currentActions, onBitWidthChange]
  );

  const handleButtonClick = useCallback(
    (value: string, type: "number" | "operation" | "function" | "special") => {
      if (controlled) {
        // In controlled mode, delegate to external handler
        onButtonClick?.(value, type);
      } else if (usingStore && storeActions) {
        // In store mode, use simplified button handling
        if (type === "number") {
          const newValue =
            currentState.currentValue === "0"
              ? value
              : currentState.currentValue + value;
          storeActions.setValue(newValue, "calculator");
        } else if (type === "operation") {
          if (value === "=") {
            // Handle equals - could implement calculation logic here
            console.log("Equals pressed in store mode");
          } else {
            storeActions.setOperation(value as Operation, "calculator");
            storeActions.setPreviousValue(
              currentState.currentValue,
              "calculator"
            );
            storeActions.setValue("0", "calculator");
          }
        } else if (type === "special") {
          if (value === "clear") {
            storeActions.setValue("0", "calculator");
            storeActions.setPreviousValue("", "calculator");
            storeActions.setOperation(null, "calculator");
          }
        }
      } else {
        // In local state mode, use full handler
        localHandlers.onButtonClick(value, type);
      }

      // Trigger operation complete callback for equals
      if (value === "=" && currentOperation && currentPreviousValue) {
        const expression = `${currentPreviousValue} ${currentOperation} ${currentValue}`;
        // Wait for state update, then get result
        setTimeout(() => {
          onOperationComplete?.(expression, currentValue);
        }, 0);
      }
    },
    [
      controlled,
      usingStore,
      storeActions,
      onButtonClick,
      localHandlers,
      currentState,
      onOperationComplete,
      currentOperation,
      currentPreviousValue,
      currentValue,
    ]
  );

  // Helper functions
  const convertAndDisplay = useCallback(
    (value: string, fromBase: Base, toBase: Base): string => {
      try {
        if (!value || value === "0") return "0";
        const decimal = parseValue(value, fromBase, currentBitWidth);
        return formatForBase(decimal.toString(), toBase);
      } catch {
        return "Error";
      }
    },
    [currentBitWidth]
  );

  const handleBitToggle = useCallback(
    (position: number) => {
      try {
        const decimal = parseValue(
          currentValue || "0",
          currentBase,
          currentBitWidth
        );
        const newDecimal = toggleBit(decimal, position, currentBitWidth);
        const newValue = formatForBase(newDecimal.toString(), currentBase);
        handleValueChange(newValue);
      } catch {
        // Handle error silently
      }
    },
    [currentValue, currentBase, currentBitWidth, handleValueChange]
  );

  const handleClear = useCallback(() => {
    if (!controlled) {
      currentActions.clearValues();
    }
    onValueChange?.("0", currentBase);
  }, [controlled, currentActions, onValueChange, currentBase]);

  // Container styling
  const containerClass = `
    ${className}
    ${maxWidth === "sm" ? "max-w-sm" : ""}
    ${maxWidth === "md" ? "max-w-md" : ""}
    ${maxWidth === "lg" ? "max-w-lg" : ""}
    ${maxWidth === "xl" ? "max-w-xl" : ""}
    ${maxWidth === "full" ? "max-w-full" : ""}
    ${compact ? "space-y-1" : "space-y-4"}
    ${borderless ? "" : "border rounded-lg p-4"}
  `.trim();

  // State change notification
  const notifyStateChange = useCallback(() => {
    // Only notify if it's not an external update
    if (!isExternalUpdate.current) {
      onStateChange?.({
        currentValue: currentValue,
        previousValue: currentPreviousValue,
        operation: currentOperation ?? null,
        base: currentBase,
        bitWidth: currentBitWidth,
      });
    }
  }, [
    currentValue,
    currentPreviousValue,
    currentOperation,
    currentBase,
    currentBitWidth,
    onStateChange,
  ]);

  // Trigger state change notification when relevant state changes
  useEffect(() => {
    notifyStateChange();
  }, [
    currentValue,
    currentPreviousValue,
    currentOperation,
    currentBase,
    currentBitWidth,
    notifyStateChange,
  ]);

  // Build expression for display
  const expression = usingStore
    ? currentPreviousValue && currentOperation
      ? `${currentPreviousValue} ${currentOperation}`
      : ""
    : currentState.expression;

  // Normal calculator layout
  const renderNormalCalculator = () => (
    <div className={`w-full ${compact ? "space-y-1" : "space-y-3"}`}>
      {/* Main Display Area */}
      <MainDisplayArea
        currentValue={currentValue}
        expression={expression}
        base={currentBase}
        bitWidth={currentBitWidth}
        error={!!currentState.error}
        convertAndDisplay={convertAndDisplay}
      />

      {/* Bit Visualization */}
      {!hideBitVisualization && !compact && (
        <div className="border rounded-lg p-2">
          <BitVisualization
            currentValue={currentValue || "0"}
            base={currentBase}
            bitWidth={currentBitWidth}
            bitsPerRow={32}
            onBitToggle={handleBitToggle}
          />
        </div>
      )}

      {/* Control Bar */}
      <ControlBar
        bitWidth={currentBitWidth}
        base={currentBase}
        onBitWidthChange={handleBitWidthChange}
        onBaseChange={handleBaseChange}
      />

      {/* Calculator Button Grid */}
      <CalculatorGrid
        base={currentBase}
        onButtonClick={handleButtonClick}
        onClear={handleClear}
      />

      {/* Status Bar */}
      {!compact && <StatusBar base={currentBase} bitWidth={currentBitWidth} />}
    </div>
  );

  return (
    <div className={containerClass}>
      {/* Calculator Content */}
      {renderNormalCalculator()}

      {/* Toast Notifications */}
      {showToaster && <Toaster />}

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-xs text-muted-foreground">
          State: {usingStore ? "Store" : "Local"} | Mode:{" "}
          {controlled ? "Controlled" : "Uncontrolled"} | Store Available:{" "}
          {storeAvailable ? "Yes" : "No"}
        </div>
      )}
    </div>
  );
}

// Export convenience hook for external state management
export function useProgrammerCal() {
  const { state, actions } = useCalculatorState();
  const { handlers } = useCalculatorLogic(state, actions);

  return {
    state,
    actions,
    handlers,
    // Utility functions
    convertAndDisplay: (
      value: string,
      fromBase: Base,
      toBase: Base,
      bitWidth: BitWidth = 32
    ): string => {
      try {
        if (!value || value === "0") return "0";
        const decimal = parseValue(value, fromBase, bitWidth);
        return formatForBase(decimal.toString(), toBase);
      } catch {
        return "Error";
      }
    },
  };
}

// Export default for backward compatibility
export default ProgrammerCal;
