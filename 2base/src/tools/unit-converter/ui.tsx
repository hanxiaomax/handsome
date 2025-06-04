"use client";

import { useState } from "react";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { toolInfo } from "./toolInfo";

// Import new architecture components and hooks
import { useUnitConverterState } from "./lib/hooks/useUnitConverterState";
import { useUnitConverterLogic } from "./lib/hooks/useUnitConverterLogic";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import { KeyboardShortcuts, QuickTips } from "./components/tips";
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
    <ToolWrapper
      toolInfo={toolInfo}
      state={{
        converterState: {
          ...uiState,
          ...businessState,
        },
      }}
    >
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Input Section - Using new InputPanel component */}
        <InputPanel
          value={uiState.inputValue}
          unit={uiState.inputUnit}
          category={uiState.selectedCategory}
          onValueChange={handlers.onInputValueChange}
          onUnitChange={handlers.onInputUnitChange}
          onCalculatorValue={handlers.onCalculatorValue}
        />

        {/* Output Section - Using new OutputPanel component */}
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

        {/* Tips and Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickTips />
          <KeyboardShortcuts />
        </div>

        {/* Custom Conversion Dialog */}
        <CustomConversionDialog
          isOpen={customDialogOpen}
          onOpenChange={setCustomDialogOpen}
          onSave={handlers.onSaveCustomConversion}
        />
      </div>
    </ToolWrapper>
  );
}
