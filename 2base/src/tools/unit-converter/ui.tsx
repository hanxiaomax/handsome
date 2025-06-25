"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { toolInfo } from "./toolInfo";

// Import new architecture components and hooks
import { useUnitConverterState } from "./lib/hooks/useUnitConverterState";
import { useUnitConverterLogic } from "./lib/hooks/useUnitConverterLogic";
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
      {/* Unit Converter Main Container - New layout with category on left */}
      <div
        id="unit-converter-main-container"
        className="w-full max-w-5xl mx-auto p-6"
      >
        {/* Main Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Unit Converter</h2>
        </div>

        {/* Main Layout - Category on left, Conversion area on right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel - Category Selection */}
          <div id="category-panel" className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Category</h3>
              <CategorySelector
                selectedCategory={uiState.selectedCategory}
                onCategoryChange={handlers.onCategoryChange}
              />
            </div>
          </div>

          {/* Right Panel - Conversion Area */}
          <div id="conversion-area" className="lg:col-span-3">
            <OutputPanel
              results={businessComputed.displayResults}
              focusedUnits={uiState.focusedUnits}
              showAllUnits={uiState.showAllUnits}
              customConversions={businessState.customConversions}
              inputValue={uiState.inputValue}
              inputUnit={uiState.inputUnit}
              category={uiState.selectedCategory}
              onToggleFocus={handlers.onToggleFocus}
              onCopyValue={handlers.onCopyValue}
              onSwapUnits={handlers.onSwapUnits}
              onToggleShowAll={handleToggleShowAll}
              onCreateCustom={handleCreateCustom}
              onInputValueChange={handlers.onInputValueChange}
              onInputUnitChange={handlers.onInputUnitChange}
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
