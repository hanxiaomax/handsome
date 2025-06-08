"use client";

// import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Calculator } from "lucide-react";

// Tool Configuration
import { toolInfo } from "./toolInfo";
import type { Base, BitWidth } from "./types";

// Business Logic
import { useCalculatorState } from "./lib/hooks/useCalculatorState";
import { useCalculatorLogic } from "./lib/hooks/useCalculatorLogic";
import { parseValue, formatForBase } from "./lib/base-converter";
import { toBinaryWithWidth } from "./lib/base-converter";
import { toggleBit, testBit } from "./lib/bitwise";

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
      const newDecimal = toggleBit(decimal, position);
      const newValue = formatForBase(newDecimal.toString(), state.base);
      actions.setCurrentValue(newValue);
    } catch {
      // Handle error silently
    }
  };

  // Get current decimal value for bit visualization
  const currentDecimal = parseValue(state.currentValue || "0", state.base);
  const binaryString64 = toBinaryWithWidth(currentDecimal, 64);

  // Render 64-bit grid (32 bits per row)
  const renderBitGrid = () => {
    const rows = [];

    // Row 1: Bits 63-32
    const row1Bits = [];
    for (let i = 63; i >= 32; i--) {
      const isSet = testBit(currentDecimal, i);
      const isDisabled = i >= state.bitWidth;
      const bitValue = binaryString64[63 - i] || "0";

      row1Bits.push(
        <button
          key={i}
          disabled={isDisabled}
          className={`w-4 h-4 text-xs font-mono border rounded ${
            isDisabled
              ? "bg-muted/50 text-muted-foreground/50 border-muted cursor-not-allowed"
              : isSet
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
          onClick={() => !isDisabled && handleBitToggle(i)}
          title={isDisabled ? `Bit ${i}: disabled` : `Bit ${i}: ${bitValue}`}
        >
          {bitValue}
        </button>
      );
    }

    // Row 2: Bits 31-0
    const row2Bits = [];
    for (let i = 31; i >= 0; i--) {
      const isSet = testBit(currentDecimal, i);
      const isDisabled = i >= state.bitWidth;
      const bitValue = binaryString64[63 - i] || "0";

      row2Bits.push(
        <button
          key={i}
          disabled={isDisabled}
          className={`w-4 h-4 text-xs font-mono border rounded ${
            isDisabled
              ? "bg-muted/50 text-muted-foreground/50 border-muted cursor-not-allowed"
              : isSet
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
          onClick={() => !isDisabled && handleBitToggle(i)}
          title={isDisabled ? `Bit ${i}: disabled` : `Bit ${i}: ${bitValue}`}
        >
          {bitValue}
        </button>
      );
    }

    rows.push(
      <div key="row1" className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
          63-32
        </span>
        <div className="flex gap-0.5">{row1Bits}</div>
      </div>
    );

    rows.push(
      <div key="row2" className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
          31-0
        </span>
        <div className="flex gap-0.5">{row2Bits}</div>
      </div>
    );

    return rows;
  };

  // Calculator button grid
  const buttonGrid = [
    // Row 1
    [
      { label: "(", value: "(", type: "special" },
      { label: ")", value: ")", type: "special" },
      { label: "XOR", value: "^", type: "operation" },
      { label: "D", value: "D", type: "number", disabled: state.base < 16 },
      { label: "E", value: "E", type: "number", disabled: state.base < 16 },
      { label: "F", value: "F", type: "number", disabled: state.base < 16 },
      { label: "⌫", value: "backspace", type: "special" },
    ],
    // Row 2
    [
      { label: "AND", value: "&", type: "operation" },
      { label: "OR", value: "|", type: "operation" },
      { label: "NOR", value: "nor", type: "function" },
      { label: "A", value: "A", type: "number", disabled: state.base < 16 },
      { label: "B", value: "B", type: "number", disabled: state.base < 16 },
      { label: "C", value: "C", type: "number", disabled: state.base < 16 },
      { label: "÷", value: "/", type: "operation" },
    ],
    // Row 3
    [
      { label: "NOT", value: "~", type: "operation" },
      { label: "<<", value: "<<", type: "operation" },
      { label: ">>", value: ">>", type: "operation" },
      { label: "7", value: "7", type: "number", disabled: state.base < 8 },
      { label: "8", value: "8", type: "number", disabled: state.base < 10 },
      { label: "9", value: "9", type: "number", disabled: state.base < 10 },
      { label: "×", value: "*", type: "operation" },
    ],
    // Row 4
    [
      { label: "NEG", value: "negate", type: "function" },
      { label: "X<<Y", value: "lsl", type: "function" },
      { label: "X>>Y", value: "lsr", type: "function" },
      { label: "4", value: "4", type: "number", disabled: state.base < 8 },
      { label: "5", value: "5", type: "number", disabled: state.base < 8 },
      { label: "6", value: "6", type: "number", disabled: state.base < 8 },
      { label: "−", value: "-", type: "operation" },
    ],
    // Row 5
    [
      { label: "mod", value: "%", type: "operation" },
      { label: "RoL", value: "rol", type: "function" },
      { label: "RoR", value: "ror", type: "function" },
      { label: "1", value: "1", type: "number" },
      { label: "2", value: "2", type: "number", disabled: state.base < 8 },
      { label: "3", value: "3", type: "number", disabled: state.base < 8 },
      { label: "+", value: "+", type: "operation" },
    ],
    // Row 6
    [
      { label: "📋", value: "copy", type: "special" },
      { label: "flip₂", value: "flip2", type: "function" },
      { label: "flip₁₆", value: "flip16", type: "function" },
      { label: "FF", value: "ff", type: "special" },
      { label: "0", value: "0", type: "number" },
      { label: "00", value: "00", type: "number" },
      { label: "=", value: "=", type: "operation" },
    ],
  ];

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
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Calculator className="h-4 w-4" />
            <h1 className="text-lg font-bold">Programmer Calculator</h1>
          </div>
        </div>

        {/* Main Display Area - Following reference image layout */}
        <div className="border rounded-lg p-3 space-y-2">
          {/* Main Value Display */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {state.base === 2
                ? "BIN"
                : state.base === 8
                ? "OCT"
                : state.base === 10
                ? "DEC"
                : "HEX"}{" "}
              ({state.bitWidth}-bit)
            </span>
            <div className="text-2xl font-mono font-bold">
              {state.error ? (
                <span className="text-destructive">Error</span>
              ) : (
                <span>{state.currentValue || "0"}</span>
              )}
            </div>
          </div>

          {/* Multi-Base Display Grid */}
          <div className="space-y-1">
            <button
              onClick={() => handleBaseSelect(16)}
              className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
                state.base === 16
                  ? "bg-accent border-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-xs text-muted-foreground">HEX</span>
              <span className="font-mono text-sm">
                {convertAndDisplay(state.currentValue, state.base, 16)}
              </span>
            </button>

            <button
              onClick={() => handleBaseSelect(10)}
              className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
                state.base === 10
                  ? "bg-accent border-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-xs text-muted-foreground">DEC</span>
              <span className="font-mono text-sm">
                {convertAndDisplay(state.currentValue, state.base, 10)}
              </span>
            </button>

            <button
              onClick={() => handleBaseSelect(8)}
              className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
                state.base === 8
                  ? "bg-accent border-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-xs text-muted-foreground">OCT</span>
              <span className="font-mono text-sm">
                {convertAndDisplay(state.currentValue, state.base, 8)}
              </span>
            </button>

            <button
              onClick={() => handleBaseSelect(2)}
              className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
                state.base === 2
                  ? "bg-accent border-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-xs text-muted-foreground">BIN</span>
              <span className="font-mono text-sm truncate">
                {convertAndDisplay(state.currentValue, state.base, 2)}
              </span>
            </button>
          </div>
        </div>

        {/* Bit Visualization - Always show 64 bits, 32 per row */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="text-xs text-muted-foreground">
            64-bit active • Click to toggle
          </div>
          <div className="space-y-1">{renderBitGrid()}</div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Set: {activeBits}</span>
            <span>Clear: {clearBits}</span>
            <span>Unused: {unusedBits}</span>
          </div>
        </div>

        {/* Control Bar - Bit Width + Control Buttons */}
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={state.bitWidth.toString()}
            onValueChange={(value) => {
              if (value) handlers.onBitWidthChange(parseInt(value) as BitWidth);
            }}
            size="sm"
          >
            <ToggleGroupItem value="8" className="h-8 px-2 text-xs">
              8
            </ToggleGroupItem>
            <ToggleGroupItem value="16" className="h-8 px-2 text-xs">
              16
            </ToggleGroupItem>
            <ToggleGroupItem value="32" className="h-8 px-2 text-xs">
              32
            </ToggleGroupItem>
            <ToggleGroupItem value="64" className="h-8 px-2 text-xs">
              64
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => handlers.onButtonClick("clear", "special")}
          >
            Clear
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => handlers.onButtonClick("~", "operation")}
          >
            NOT
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => handlers.onButtonClick("<<", "operation")}
          >
            LSL
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => handlers.onButtonClick(">>", "operation")}
          >
            LSR
          </Button>
        </div>

        {/* Calculator Button Grid - Compact */}
        <div className="border rounded-lg p-2">
          <div className="grid grid-cols-7 gap-1">
            {buttonGrid.flat().map((button, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                disabled={button.disabled}
                className="h-8 text-xs font-mono"
                onClick={() =>
                  handlers.onButtonClick(
                    button.value,
                    button.type as
                      | "number"
                      | "operation"
                      | "function"
                      | "special"
                  )
                }
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div>Mode: Programmer</div>
          <div>Base: {state.base}</div>
          <div>Width: {state.bitWidth}-bit</div>
        </div>
      </div>
    </ToolWrapper>
  );
}
