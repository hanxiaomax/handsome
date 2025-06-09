"use client";

// import { useState } from "react";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Toaster } from "sonner";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

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
import { AdvancedBitwiseVisualization } from "./components/AdvancedBitwiseVisualization";

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

  // Bitwise Boot 处理函数
  const handleBitwiseBootClick = () => {
    actions.setAdvancedMode(!state.isAdvancedMode);
  };

  // 退出高级模式
  const handleExitAdvancedMode = () => {
    actions.setAdvancedMode(false);
  };

  // 普通计算器组件
  const renderNormalCalculator = () => (
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
        onBitWidthChange={(width: BitWidth) => handlers.onBitWidthChange(width)}
        onBaseChange={(base: Base) => handleBaseSelect(base)}
      />

      {/* Calculator Button Grid */}
      <CalculatorGrid
        base={state.base}
        onButtonClick={(value: string, type) =>
          handlers.onButtonClick(value, type)
        }
        onClear={handleClear}
        onBitwiseBootClick={handleBitwiseBootClick}
      />

      {/* Status Bar */}
      <StatusBar base={state.base} bitWidth={state.bitWidth} />
    </div>
  );

  // 高级模式双栏布局
  const renderAdvancedMode = () => (
    <div className="h-[calc(100vh-8rem)] mt-5">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Calculator */}
        <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
          <div className="h-full flex flex-col">
            {/* 返回按钮 */}
            <div className="p-3 border-b bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExitAdvancedMode}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Exit Advanced Mode
              </Button>
            </div>

            {/* 计算器内容 */}
            <div className="flex-1 overflow-auto p-3">
              <div className="space-y-2">
                {/* Main Display Area */}
                <MainDisplayArea
                  currentValue={state.currentValue}
                  expression={state.expression}
                  base={state.base}
                  bitWidth={state.bitWidth}
                  error={!!state.error}
                  convertAndDisplay={convertAndDisplay}
                />

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
                  onBitwiseBootClick={handleBitwiseBootClick}
                />

                {/* Status Bar */}
                <StatusBar base={state.base} bitWidth={state.bitWidth} />
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Advanced Visualization */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full overflow-auto p-4">
            <AdvancedBitwiseVisualization
              currentValue={state.currentValue}
              base={state.base}
              bitWidth={state.bitWidth}
              onValueChange={(value: string) => {
                actions.setCurrentValue(value);
              }}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );

  return (
    <ToolWrapper
      toolInfo={toolInfo}
      state={{ calculatorState: state }}
      maxWidth="full"
    >
      {state.isAdvancedMode ? renderAdvancedMode() : renderNormalCalculator()}
      <Toaster />
    </ToolWrapper>
  );
}
