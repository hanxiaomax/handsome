"use client";

import { useState } from "react";
// Card components removed for cleaner, more minimalist design
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToolWrapper } from "@/components/common/tool-wrapper";

// Tool Configuration
import { toolInfo } from "./toolInfo";
import type { BitWidth } from "./types";

// Business Logic (Hooks)
import { useCalculatorState } from "./lib/hooks/useCalculatorState";
import { useCalculatorLogic } from "./lib/hooks/useCalculatorLogic";

// UI Components
import { Display } from "./components/display";
import { BitGrid } from "./components/bit-grid";
import { FloatingCalculator } from "./components/floating-calculator";
import { NumberBaseConverter } from "./components/number-base-converter";
import { BitOperationsPanel } from "./components/bit-operations-panel";

// New Components (placeholder implementations - to be implemented)
// import { EncodingConverter } from "./components/encoding-converter";
// import { HashGenerator } from "./components/hash-generator";
// import { FloatingPointAnalyzer } from "./components/floating-point-analyzer";
// import { OperationHistory } from "./components/operation-history";

export default function ProgrammerCalculator() {
  // State Management Hook
  const { state, actions } = useCalculatorState();

  // Business Logic Hook
  const { handlers } = useCalculatorLogic(state, actions);

  // UI State for tabs
  const [activeTab, setActiveTab] = useState("converter");

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ calculatorState: state }}>
      {/* Main Tool Container - Left-Right Split Layout */}
      <div
        id="programmer-calculator-container"
        className="w-full h-[calc(100vh-8rem)] p-6 mt-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Left Panel - Enhanced Calculator with Display and Visualization */}
          <div
            id="left-calculator-panel"
            className="lg:col-span-1 space-y-3 flex flex-col"
          >
            {/* Enhanced Display Section - Multi-base and Bit Visualization */}
            <div id="calculator-display" className="space-y-4">
              <Display
                value={state.currentValue}
                currentBase={state.base}
                bitWidth={state.bitWidth}
                error={state.error}
                onBaseChange={handlers.onBaseChange}
              />

              {/* Integrated Bit Visualization */}
              <div className="bg-background border rounded-lg p-2">
                <BitGrid
                  value={state.currentValue}
                  base={state.base}
                  bitWidth={state.bitWidth}
                  onValueChange={handlers.onBitValueChange}
                />
              </div>
            </div>

            {/* Compact Quick Controls - Only Bit Width */}
            <div id="quick-controls" className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Bit Width
                </label>
                <ToggleGroup
                  type="single"
                  value={state.bitWidth.toString()}
                  onValueChange={(value) => {
                    if (value)
                      handlers.onBitWidthChange(parseInt(value) as BitWidth);
                  }}
                  className="w-full"
                >
                  <ToggleGroupItem value="8" className="flex-1 text-xs h-8">
                    8
                  </ToggleGroupItem>
                  <ToggleGroupItem value="16" className="flex-1 text-xs h-8">
                    16
                  </ToggleGroupItem>
                  <ToggleGroupItem value="32" className="flex-1 text-xs h-8">
                    32
                  </ToggleGroupItem>
                  <ToggleGroupItem value="64" className="flex-1 text-xs h-8">
                    64
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Calculator Guide */}
            <div
              id="calculator-guide"
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center text-muted-foreground">
                <div className="text-sm font-medium mb-2">Calculator Input</div>
                <p className="text-xs opacity-70">
                  Use the floating calculator button
                </p>
                <p className="text-xs opacity-70">in the bottom right corner</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Tools and Features */}
          <div
            id="right-tools-panel"
            className="lg:col-span-2 flex flex-col h-full"
          >
            {/* Tabbed Content Areas - Horizontal Layout */}
            <div id="tabbed-content-area" className="flex-1 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                {/* Horizontal Tab List */}
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="converter" className="text-xs">
                    Number Base
                  </TabsTrigger>
                  <TabsTrigger value="bitops" className="text-xs">
                    Bit Operations
                  </TabsTrigger>
                  <TabsTrigger value="encoding" className="text-xs">
                    Encoding
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="text-xs">
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="text-xs">
                    Tools
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content Area */}
                <div className="flex-1 overflow-auto mt-4">
                  {/* Tab 1: Number Base Converter */}
                  <TabsContent
                    value="converter"
                    className="h-full overflow-auto mt-0"
                  >
                    <div className="p-6">
                      <NumberBaseConverter
                        currentValue={state.currentValue}
                        currentBase={state.base}
                        onValueChange={handlers.onBitValueChange}
                        onBaseChange={handlers.onBaseChange}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab 2: Bit Operations */}
                  <TabsContent
                    value="bitops"
                    className="h-full overflow-auto mt-0"
                  >
                    <div className="p-6">
                      <BitOperationsPanel
                        value={state.currentValue}
                        base={state.base}
                        bitWidth={state.bitWidth}
                        onValueChange={handlers.onBitValueChange}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab 3: Encoding Tools */}
                  <TabsContent
                    value="encoding"
                    className="h-full overflow-auto mt-0"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Encoding Converter
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Convert between different text encodings
                        </p>
                        <div className="h-32 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Encoding Converter - Coming Soon
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Hash Generator</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate MD5, SHA1, SHA256 hashes
                        </p>
                        <div className="h-32 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Hash Generator - Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 4: Analysis Tools */}
                  <TabsContent
                    value="analysis"
                    className="h-full overflow-auto mt-0"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Floating Point Analyzer
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Analyze IEEE 754 floating point representation
                        </p>
                        <div className="h-32 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Floating Point Analyzer - Coming Soon
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Endianness Converter
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Convert between Big Endian and Little Endian byte
                          order
                        </p>
                        <div className="h-32 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Endianness Converter - Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 5: Additional Tools */}
                  <TabsContent
                    value="tools"
                    className="h-full overflow-auto mt-0"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Operation History
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          View history of calculations and operations
                        </p>
                        <div className="h-32 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Operation History - Coming Soon
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Batch Converter</h3>
                        <p className="text-sm text-muted-foreground">
                          Convert multiple numbers at once
                        </p>
                        <div className="h-32 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Batch Converter - Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Calculator */}
      <FloatingCalculator
        base={state.base}
        mode="programmer"
        onButtonClick={handlers.onButtonClick}
      />
    </ToolWrapper>
  );
}
