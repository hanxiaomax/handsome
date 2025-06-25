"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { toolInfo } from "./toolInfo";

// Import new architecture components and hooks
import { useUnitConverterState } from "./lib/hooks/useUnitConverterState";
import { useUnitConverterLogic } from "./lib/hooks/useUnitConverterLogic";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
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
      {/* Unit Converter Main Container - Comprehensive conversion workspace */}
      <div id="unit-converter-main-container" className="w-full p-6 space-y-6">
        {/* Input Section - User input for value and unit selection */}
        <div id="input-section" className="space-y-4">
          <InputPanel
            value={uiState.inputValue}
            unit={uiState.inputUnit}
            category={uiState.selectedCategory}
            onValueChange={handlers.onInputValueChange}
            onUnitChange={handlers.onInputUnitChange}
            onCategoryChange={handlers.onCategoryChange}
          />
        </div>

        {/* Results Section - Conversion output and results display */}
        <div id="results-section" className="space-y-4">
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
