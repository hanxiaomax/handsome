import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Display } from "./components/display";
import { BitGrid } from "./components/bit-grid";
import { ButtonGrid } from "./components/button-grid";
import { SettingsPanel } from "./components/settings-panel";
import { toolInfo } from "./toolInfo";
import type {
  CalculatorState,
  ButtonConfig,
  Base,
  BitWidth,
  CalculatorMode,
  AngleUnit,
  Operation,
} from "./types";
import {
  performCalculation,
  performScientificFunction,
  formatResult,
  validateInput,
} from "./lib/calculator";
import { parseValue } from "./lib/base-converter";

const initialState: CalculatorState = {
  currentValue: "0",
  previousValue: "",
  operation: null,
  base: 10,
  bitWidth: 32,
  mode: "programmer",
  angleUnit: "deg",
  memory: 0,
  history: [],
  isNewNumber: true,
  error: null,
};

export default function ProgrammerCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);

  const handleButtonClick = useCallback(
    (value: string, type: ButtonConfig["type"]) => {
      setState((prevState) => {
        try {
          const newState = { ...prevState, error: null };

          switch (type) {
            case "number":
              if (!validateInput(value, prevState.base)) {
                return {
                  ...prevState,
                  error: "Invalid digit for current base",
                };
              }

              if (prevState.isNewNumber) {
                newState.currentValue = value === "0" ? "0" : value;
                newState.isNewNumber = false;
              } else {
                newState.currentValue =
                  prevState.currentValue === "0"
                    ? value
                    : prevState.currentValue + value;
              }
              break;

            case "operation":
              if (value === "=") {
                if (prevState.operation && prevState.previousValue) {
                  const result = performCalculation(
                    prevState.previousValue,
                    prevState.currentValue,
                    prevState.operation,
                    prevState.base,
                    prevState.bitWidth
                  );
                  newState.currentValue = formatResult(result, prevState.base);
                  newState.previousValue = "";
                  newState.operation = null;
                  newState.isNewNumber = true;
                }
              } else {
                if (
                  prevState.operation &&
                  prevState.previousValue &&
                  !prevState.isNewNumber
                ) {
                  const result = performCalculation(
                    prevState.previousValue,
                    prevState.currentValue,
                    prevState.operation,
                    prevState.base,
                    prevState.bitWidth
                  );
                  newState.currentValue = formatResult(result, prevState.base);
                }
                newState.previousValue = newState.currentValue;
                newState.operation = value as Operation;
                newState.isNewNumber = true;
              }
              break;

            case "function": {
              const result = performScientificFunction(
                prevState.currentValue,
                value,
                prevState.base,
                prevState.angleUnit
              );
              newState.currentValue = formatResult(result, prevState.base);
              newState.isNewNumber = true;
              break;
            }

            case "special":
              switch (value) {
                case "clear":
                  return initialState;
                case "backspace":
                  if (prevState.currentValue.length > 1) {
                    newState.currentValue = prevState.currentValue.slice(0, -1);
                  } else {
                    newState.currentValue = "0";
                    newState.isNewNumber = true;
                  }
                  break;
                case "memory-add":
                  newState.memory =
                    prevState.memory +
                    parseValue(prevState.currentValue, prevState.base);
                  break;
                case "memory-subtract":
                  newState.memory =
                    prevState.memory -
                    parseValue(prevState.currentValue, prevState.base);
                  break;
                case "memory-recall":
                  newState.currentValue = formatResult(
                    prevState.memory,
                    prevState.base
                  );
                  newState.isNewNumber = true;
                  break;
                case "memory-clear":
                  newState.memory = 0;
                  break;
              }
              break;
          }

          return newState;
        } catch (error) {
          return {
            ...prevState,
            error: error instanceof Error ? error.message : "Calculation error",
          };
        }
      });
    },
    []
  );

  const handleBaseChange = useCallback((newBase: Base) => {
    setState((prevState) => {
      try {
        const decimal = parseValue(prevState.currentValue, prevState.base);
        const newValue = formatResult(decimal, newBase);
        return {
          ...prevState,
          base: newBase,
          currentValue: newValue,
          error: null,
        };
      } catch {
        return {
          ...prevState,
          base: newBase,
          currentValue: "0",
          error: "Base conversion error",
        };
      }
    });
  }, []);

  const handleBitWidthChange = useCallback((newBitWidth: BitWidth) => {
    setState((prevState) => ({
      ...prevState,
      bitWidth: newBitWidth,
    }));
  }, []);

  const handleModeChange = useCallback((newMode: CalculatorMode) => {
    setState((prevState) => ({
      ...prevState,
      mode: newMode,
    }));
  }, []);

  const handleAngleUnitChange = useCallback((newUnit: AngleUnit) => {
    setState((prevState) => ({
      ...prevState,
      angleUnit: newUnit,
    }));
  }, []);

  const handleBitValueChange = useCallback((newValue: string) => {
    setState((prevState) => ({
      ...prevState,
      currentValue: newValue,
      isNewNumber: false,
      error: null,
    }));
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey } = event;

      // Prevent default for calculator keys
      if (
        /[0-9A-Fa-f+\-*/%&|^~()=]/.test(key) ||
        key === "Enter" ||
        key === "Escape" ||
        key === "Backspace"
      ) {
        event.preventDefault();
      }

      // Base switching shortcuts
      if (ctrlKey) {
        switch (key) {
          case "1":
            handleBaseChange(2);
            return;
          case "2":
            handleBaseChange(8);
            return;
          case "3":
            handleBaseChange(10);
            return;
          case "4":
            handleBaseChange(16);
            return;
        }
      }

      // Handle key input
      if (/[0-9A-Fa-f]/.test(key)) {
        handleButtonClick(key.toUpperCase(), "number");
      } else {
        switch (key) {
          case "+":
          case "-":
          case "*":
          case "/":
          case "%":
          case "&":
          case "|":
          case "^":
          case "~":
            handleButtonClick(key, "operation");
            break;
          case "Enter":
          case "=":
            handleButtonClick("=", "operation");
            break;
          case "Escape":
            handleButtonClick("clear", "special");
            break;
          case "Backspace":
            handleButtonClick("backspace", "special");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.base, handleBaseChange, handleButtonClick]);

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ calculatorState: state }}>
      <div className="w-full p-6 space-y-6 mt-5">
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
              onBaseChange={handleBaseChange}
              onBitWidthChange={handleBitWidthChange}
              onModeChange={handleModeChange}
              onAngleUnitChange={handleAngleUnitChange}
            />
          </div>

          {/* Middle Column: Calculator Buttons */}
          <div className="lg:col-span-1">
            <ButtonGrid
              base={state.base}
              mode={state.mode}
              onButtonClick={handleButtonClick}
            />
          </div>

          {/* Right Column: Bit Visualization */}
          <div className="lg:col-span-2 xl:col-span-1">
            <BitGrid
              value={state.currentValue}
              base={state.base}
              bitWidth={state.bitWidth}
              onValueChange={handleBitValueChange}
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
