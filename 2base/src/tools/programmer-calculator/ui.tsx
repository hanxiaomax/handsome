"use client";

// import { useState } from "react";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Toaster } from "sonner";

// Tool Configuration
import { toolInfo } from "./toolInfo";
import type { Base, BitWidth } from "./types";

// Business Logic
import { useCalculatorState } from "./lib/hooks/useCalculatorState";
import { useCalculatorLogic } from "./lib/hooks/useCalculatorLogic";
import { parseValue, formatForBase } from "./lib/base-converter";
import { toggleBit } from "./lib/bitwise";

// Tool-specific Components
import {
  MainDisplayArea,
  BitVisualization,
  ControlBar,
  CalculatorGrid,
  StatusBar,
} from "./components";

export default function ProgrammerCalculator() {
  // State Management
  const { state, actions } = useCalculatorState();
  const { handlers } = useCalculatorLogic(state, actions);

  // Helper functions
  const convertAndDisplay = (
    value: string,
    fromBase: Base,
    toBase: Base
  ): string => {
    try {
      if (!value || value === "0") return "0";
      const decimal = parseValue(value, fromBase, state.bitWidth);
      return formatForBase(decimal.toString(), toBase);
    } catch {
      return "Error";
    }
  };

  const handleBaseSelect = (base: Base) => {
    try {
      const decimal = parseValue(
        state.currentValue || "0",
        state.base,
        state.bitWidth
      );
      const newValue = formatForBase(decimal.toString(), base);
      actions.setBase(base);
      actions.setCurrentValue(newValue);
    } catch {
      actions.setBase(base);
      actions.setCurrentValue("0");
    }
  };

  const handleBitToggle = (position: number) => {
    try {
      const decimal = parseValue(
        state.currentValue || "0",
        state.base,
        state.bitWidth
      );
      const newDecimal = toggleBit(decimal, position, state.bitWidth);
      const newValue = formatForBase(newDecimal.toString(), state.base);
      actions.setCurrentValue(newValue);
    } catch {
      // Handle error silently
    }
  };

  const handleClear = () => {
    actions.clearValues();
  };

  return (
    <ToolWrapper
      toolInfo={toolInfo}
      state={{ calculatorState: state }}
      maxWidth="full"
    >
      {/* Main Calculator Panel */}
      <div
        id="programmer-calculator-panel"
        className="w-full mt-5 max-w-3xl mx-auto border rounded-lg p-3 space-y-2"
      >
        {/* Main Display Area */}
        <MainDisplayArea
          currentValue={state.currentValue}
          expression={state.expression}
          base={state.base}
          bitWidth={state.bitWidth}
          error={!!state.error}
          convertAndDisplay={convertAndDisplay}
        />
        <div className="border rounded-lg p-2">
          {/* Bit Visualization */}
          <BitVisualization
            currentValue={state.currentValue || "0"}
            base={state.base}
            bitWidth={state.bitWidth}
            bitsPerRow={32}
            onBitToggle={handleBitToggle}
          />
        </div>

        {/* Control Bar */}
        <ControlBar
          bitWidth={state.bitWidth}
          base={state.base}
          onBitWidthChange={(width: BitWidth) =>
            handlers.onBitWidthChange(width)
          }
          onBaseChange={(base: Base) => handleBaseSelect(base)}
        />

        {/* Calculator Button Grid */}
        <CalculatorGrid
          base={state.base}
          onButtonClick={(value: string, type) =>
            handlers.onButtonClick(value, type)
          }
          onClear={handleClear}
        />

        {/* Status Bar */}
        <StatusBar base={state.base} bitWidth={state.bitWidth} />
      </div>
      <Toaster />
    </ToolWrapper>
  );
}
