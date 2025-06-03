"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolWrapper } from "@/components/common/tool-wrapper";

// Tool Configuration
import { toolInfo } from "./toolInfo";

// Business Logic (Hooks)
import { useCalculatorState } from "./lib/hooks/useCalculatorState";
import { useCalculatorLogic } from "./lib/hooks/useCalculatorLogic";

// UI Components
import { Display } from "./components/display";
import { BitGrid } from "./components/bit-grid";
import { ButtonGrid } from "./components/button-grid";
import { SettingsPanel } from "./components/settings-panel";

export default function ProgrammerCalculator() {
  // State Management Hook
  const { state, actions } = useCalculatorState();

  // Business Logic Hook
  const { handlers } = useCalculatorLogic(state, actions);

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ calculatorState: state }}>
      {/* Tool Layout Structure */}
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Left Column: Display and Settings */}
          <div className="space-y-4 lg:col-span-1">
            <Display
              value={state.currentValue}
              currentBase={state.base}
              bitWidth={state.bitWidth}
              error={state.error}
            />
            <SettingsPanel
              base={state.base}
              bitWidth={state.bitWidth}
              mode={state.mode}
              angleUnit={state.angleUnit}
              memory={state.memory}
              onBaseChange={handlers.onBaseChange}
              onBitWidthChange={handlers.onBitWidthChange}
              onModeChange={handlers.onModeChange}
              onAngleUnitChange={handlers.onAngleUnitChange}
            />
          </div>

          {/* Middle Column: Calculator Buttons */}
          <div className="lg:col-span-1">
            <ButtonGrid
              base={state.base}
              mode={state.mode}
              onButtonClick={handlers.onButtonClick}
            />
          </div>

          {/* Right Column: Bit Visualization */}
          <div className="lg:col-span-2 xl:col-span-1">
            <BitGrid
              value={state.currentValue}
              base={state.base}
              bitWidth={state.bitWidth}
              onValueChange={handlers.onBitValueChange}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Numbers & Operations</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>0-9, A-F: Input digits</li>
                  <li>+, -, *, /, %: Arithmetic</li>
                  <li>&, |, ^, ~: Bitwise ops</li>
                  <li>Enter/=: Calculate</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Base Switching</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Ctrl+1: Binary</li>
                  <li>Ctrl+2: Octal</li>
                  <li>Ctrl+3: Decimal</li>
                  <li>Ctrl+4: Hexadecimal</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Special Keys</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Escape: Clear all</li>
                  <li>Backspace: Delete digit</li>
                  <li>Tab: Navigate controls</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Bit Operations</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Click bits to toggle</li>
                  <li>Visual binary display</li>
                  <li>Real-time conversion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Memory Functions</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>M+: Add to memory</li>
                  <li>M-: Subtract from memory</li>
                  <li>MR: Recall memory</li>
                  <li>MC: Clear memory</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Scientific Functions</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>sin, cos, tan</li>
                  <li>log, ln, sqrt</li>
                  <li>x², x³, xʸ</li>
                  <li>π, e constants</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolWrapper>
  );
}
