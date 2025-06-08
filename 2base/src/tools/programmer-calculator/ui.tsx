"use client";

// import { useState } from "react";
import { ToolWrapper } from "@/components/common/tool-wrapper";

// Tool Configuration
import { toolInfo } from "./toolInfo";
import type { Base, BitWidth } from "./types";

// Business Logic
import { useCalculatorState } from "./lib/hooks/useCalculatorState";
import { useCalculatorLogic } from "./lib/hooks/useCalculatorLogic";
import { parseValue, formatForBase } from "./lib/base-converter";
import { toBinaryWithWidth } from "./lib/base-converter";
import { toggleBit, testBit } from "./lib/bitwise";

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
      const decimal = parseValue(value, fromBase);
      return formatForBase(decimal.toString(), toBase);
    } catch {
      return "Error";
    }
  };

  const handleBaseSelect = (base: Base) => {
    try {
      const decimal = parseValue(state.currentValue || "0", state.base);
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
      const decimal = parseValue(state.currentValue || "0", state.base);
      const newDecimal = toggleBit(decimal, position, state.bitWidth);
      const newValue = formatForBase(newDecimal.toString(), state.base);
      actions.setCurrentValue(newValue);
    } catch {
      // Handle error silently
    }
  };

  // Get current decimal value for bit visualization
  const currentDecimal = parseValue(state.currentValue || "0", state.base);

  // Calculate bit statistics
  const binaryString64 = toBinaryWithWidth(currentDecimal, 64);
  const activeBits =
    binaryString64.substring(64 - state.bitWidth).split("1").length - 1;
  const clearBits = state.bitWidth - activeBits;
  const unusedBits = 64 - state.bitWidth;

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ calculatorState: state }}>
      {/* Main Calculator Panel */}
      <div
        id="programmer-calculator-panel"
        className="w-full max-w-3xl mx-auto p-3 space-y-3"
      >
        {/* Main Display Area */}
        <MainDisplayArea
          currentValue={state.currentValue}
          base={state.base}
          bitWidth={state.bitWidth}
          error={!!state.error}
          onBaseSelect={handleBaseSelect}
          convertAndDisplay={convertAndDisplay}
        />

        {/* Bit Visualization */}
        <BitVisualization
          currentDecimal={currentDecimal}
          bitWidth={state.bitWidth}
          activeBits={activeBits}
          clearBits={clearBits}
          unusedBits={unusedBits}
          bitsPerRow={32}
          onBitToggle={handleBitToggle}
          testBit={testBit}
        />

        {/* Control Bar */}
        <ControlBar
          bitWidth={state.bitWidth}
          onBitWidthChange={(width: BitWidth) =>
            handlers.onBitWidthChange(width)
          }
        />

        {/* Calculator Button Grid */}
        <CalculatorGrid
          base={state.base}
          onButtonClick={(value: string, type) =>
            handlers.onButtonClick(value, type)
          }
        />

        {/* Status Bar */}
        <StatusBar base={state.base} bitWidth={state.bitWidth} />
      </div>
    </ToolWrapper>
  );
}
