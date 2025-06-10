"use client";

import { useCallback, useEffect } from "react";

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

  // Controlled/Uncontrolled mode
  controlled?: boolean;

  // Controlled mode props - external state
  value?: string;
  base?: Base;
  bitWidth?: BitWidth;
  previousValue?: string;
  operation?: Operation | null;

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
 * ProgrammerCal - Comprehensive Programmer Calculator Component
 *
 * A fully-featured programmer calculator with multi-base support, bitwise operations,
 * and advanced visualization capabilities. Supports both controlled and uncontrolled modes.
 *
 * @example
 * // Uncontrolled mode (default)
 * <ProgrammerCal />
 *
 * @example
 * // Controlled mode with external state binding
 * <ProgrammerCal
 *   controlled={true}
 *   value={sharedValue}
 *   base={sharedBase}
 *   bitWidth={sharedBitWidth}
 *   onValueChange={(value, base) => setSharedValue(value)}
 *   onBaseChange={(base) => setSharedBase(base)}
 *   onBitWidthChange={(bitWidth) => setSharedBitWidth(bitWidth)}
 * />
 */
export function ProgrammerCal({
  className = "",
  maxWidth = "full",
  showToaster = true,
  controlled = false,
  // Controlled mode props
  value,
  base,
  bitWidth,
  previousValue,
  operation,
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
  // State Management
  const { state, actions } = useCalculatorState();
  const { handlers } = useCalculatorLogic(state, actions);

  // Initialize state for uncontrolled mode
  useEffect(() => {
    if (!controlled) {
      if (initialBase !== 10 && state.base === 10) actions.setBase(initialBase);
      if (initialBitWidth !== 32 && state.bitWidth === 32)
        actions.setBitWidth(initialBitWidth);
      if (initialValue !== "0" && state.currentValue === "0")
        actions.setCurrentValue(initialValue);
    }
  }, [
    controlled,
    initialBase,
    initialBitWidth,
    initialValue,
    actions,
    state.base,
    state.bitWidth,
    state.currentValue,
  ]);

  // Sync external state for controlled mode
  useEffect(() => {
    if (controlled) {
      if (value !== undefined && value !== state.currentValue) {
        actions.setCurrentValue(value);
      }
      if (base !== undefined && base !== state.base) {
        actions.setBase(base);
      }
      if (bitWidth !== undefined && bitWidth !== state.bitWidth) {
        actions.setBitWidth(bitWidth);
      }
      if (
        previousValue !== undefined &&
        previousValue !== state.previousValue
      ) {
        actions.setPreviousValue(previousValue);
      }
      if (operation !== undefined && operation !== state.operation) {
        actions.setOperation(operation);
      }
    }
  }, [
    controlled,
    value,
    base,
    bitWidth,
    previousValue,
    operation,
    state,
    actions,
  ]);

  // Get current effective values (controlled or internal state)
  const currentValue = controlled ? value || "0" : state.currentValue;
  const currentBase = controlled ? base || 10 : state.base;
  const currentBitWidth = controlled ? bitWidth || 32 : state.bitWidth;
  const currentPreviousValue = controlled
    ? previousValue || ""
    : state.previousValue;
  const currentOperation = controlled ? operation : state.operation;

  // Enhanced event handlers with callbacks
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!controlled) {
        actions.setCurrentValue(newValue);
      }
      onValueChange?.(newValue, currentBase);
    },
    [controlled, actions, onValueChange, currentBase]
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
          actions.setBase(newBase);
          actions.setCurrentValue(newValue);
        }

        onBaseChange?.(newBase);
        onValueChange?.(newValue, newBase);
      } catch {
        if (!controlled) {
          actions.setBase(newBase);
          actions.setCurrentValue("0");
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
      actions,
      onBaseChange,
      onValueChange,
    ]
  );

  const handleBitWidthChange = useCallback(
    (newBitWidth: BitWidth) => {
      if (!controlled) {
        actions.setBitWidth(newBitWidth);
      }
      onBitWidthChange?.(newBitWidth);
    },
    [controlled, actions, onBitWidthChange]
  );

  const handleButtonClick = useCallback(
    (value: string, type: "number" | "operation" | "function" | "special") => {
      if (controlled) {
        // In controlled mode, delegate to external handler
        onButtonClick?.(value, type);
      } else {
        // In uncontrolled mode, use internal handler
        handlers.onButtonClick(value, type);
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
      onButtonClick,
      handlers,
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
      actions.clearValues();
    }
    onValueChange?.("0", currentBase);
  }, [controlled, actions, onValueChange, currentBase]);

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
    onStateChange?.({
      currentValue: currentValue,
      previousValue: currentPreviousValue,
      operation: currentOperation ?? null,
      base: currentBase,
      bitWidth: currentBitWidth,
    });
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
  const expression =
    currentPreviousValue && currentOperation
      ? `${currentPreviousValue} ${currentOperation}`
      : "";

  // Normal calculator layout
  const renderNormalCalculator = () => (
    <div className={`w-full ${compact ? "space-y-1" : "space-y-3"}`}>
      {/* Main Display Area */}
      <MainDisplayArea
        currentValue={currentValue}
        expression={expression}
        base={currentBase}
        bitWidth={currentBitWidth}
        error={!!state.error}
        convertAndDisplay={convertAndDisplay}
      />

      {/* Bit Visualization */}
      {!compact && (
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
