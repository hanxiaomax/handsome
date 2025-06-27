"use client";

import { ToolLayout } from "@/components/layout/tool-layout";
import { CategorySelector } from "./components/CategorySelector";
import { OutputPanel } from "./components/OutputPanel";
import { useToolControls } from "@/hooks/use-tool-controls";
import { useUnitConverterState } from "./lib/hooks/useUnitConverterState";
import { useUnitConverterLogic } from "./lib/hooks/useUnitConverterLogic";
import { toolInfo } from "./toolInfo";
import type { CategoryId } from "./lib/config";
import type { ConversionResult } from "./types";
import { useState } from "react";

export default function UnitConverter() {
  const { toolLayoutProps } = useToolControls({ toolInfo });
  const { state, setState } = useUnitConverterState();
  const logic = useUnitConverterLogic(state, setState);

  // 用于管理焦点单位的状态
  const [focusedUnits, setFocusedUnits] = useState<string[]>([]);

  // 切换单位焦点状态
  const handleToggleFocus = (unitId: string) => {
    setFocusedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  // 交换单位
  const handleSwapUnits = (result: ConversionResult) => {
    // 将选中的单位设为输入单位，并使用当前的转换值作为新的输入值
    logic.handleInputChange(result.formattedValue, result.unit.id);
  };

  return (
    <ToolLayout {...toolLayoutProps}>
      {/* Main Tool Container - Left-Right Layout */}
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Panel - Category Selection */}
          <div id="category-panel" className="lg:col-span-1">
            <CategorySelector
              selectedCategory={state.selectedCategory}
              onCategoryChange={(categoryId: string) =>
                logic.handleCategoryChange(categoryId as CategoryId)
              }
            />
          </div>

          {/* Right Panel - Input and Conversion Results */}
          <div id="conversion-panel" className="lg:col-span-2">
            <OutputPanel
              inputValue={state.inputValue}
              inputUnit={state.inputUnit}
              availableUnits={state.availableUnits}
              results={state.results}
              isProcessing={state.isProcessing}
              error={state.error}
              focusedUnits={focusedUnits}
              selectedCategory={state.selectedCategory}
              onInputValueChange={(value: string) =>
                logic.handleInputChange(value)
              }
              onInputUnitChange={logic.handleUnitChange}
              onToggleFocus={handleToggleFocus}
              onSwapUnits={handleSwapUnits}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
