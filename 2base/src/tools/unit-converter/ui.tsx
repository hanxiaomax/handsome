"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { toolInfo } from "./toolInfo";

// Import new architecture components and hooks
import { useUnitConverterState } from "./lib/hooks/useUnitConverterState";
import { useUnitConverterLogic } from "./lib/hooks/useUnitConverterLogic";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import { CategorySelector } from "./components/CategorySelector";
import { CustomConversionDialog } from "./components/custom-conversion-dialog";

export default function UnitConverter() {
  // Initialize state management
  const { state: uiState, actions: uiActions } = useUnitConverterState();

  // Initialize business logic
  const {
    businessState,
    computed: businessComputed,
    handlers,
  } = useUnitConverterLogic(uiState, uiActions);

  // Local state for custom conversion dialog
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  // Handle create custom conversion
  const handleCreateCustom = () => {
    setCustomDialogOpen(true);
  };

  // Handle toggle show all units
  const handleToggleShowAll = () => {
    uiActions.setShowAllUnits(!uiState.showAllUnits);
  };

  return (
    <ToolLayout toolName={toolInfo.name} toolDescription={toolInfo.description}>
      {/* Unit Converter Main Container - Clean layout with category header */}
      <div
        id="unit-converter-main-container"
        className="w-full max-w-4xl mx-auto p-6 space-y-8"
      >
        {/* Category Selection Header - Independent of conversion area */}
        <div id="category-header" className="text-center">
          <h2 className="text-2xl font-bold mb-6">Unit Converter</h2>
          <div className="max-w-xs mx-auto">
            <CategorySelector
              selectedCategory={uiState.selectedCategory}
              onCategoryChange={handlers.onCategoryChange}
            />
          </div>
        </div>

        {/* Conversion Area - Left input, Right results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel - Simple Input without title */}
          <div id="input-panel">
            <InputPanel
              value={uiState.inputValue}
              unit={uiState.inputUnit}
              category={uiState.selectedCategory}
              onValueChange={handlers.onInputValueChange}
              onUnitChange={handlers.onInputUnitChange}
            />
          </div>

          {/* Right Panel - Results without title */}
          <div id="results-panel">
            <OutputPanel
              results={businessComputed.displayResults}
              focusedUnits={uiState.focusedUnits}
              showAllUnits={uiState.showAllUnits}
              customConversions={businessState.customConversions}
              inputValue={uiState.inputValue}
              onToggleFocus={handlers.onToggleFocus}
              onCopyValue={handlers.onCopyValue}
              onSwapUnits={handlers.onSwapUnits}
              onToggleShowAll={handleToggleShowAll}
              onCreateCustom={handleCreateCustom}
            />
          </div>
        </div>

        {/* Custom Conversion Dialog - Advanced conversion creation */}
        <CustomConversionDialog
          isOpen={customDialogOpen}
          onOpenChange={setCustomDialogOpen}
          onSave={handlers.onSaveCustomConversion}
        />
      </div>
    </ToolLayout>
  );
}
