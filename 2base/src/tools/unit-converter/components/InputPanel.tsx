import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySelector } from "./CategorySelector";
import { UnitCombobox } from "./combobox";
import { ScientificCalculator } from "./calculator";
import type { InputPanelProps } from "../types";
import { unitCategories } from "../lib/data";

/**
 * Input Panel Component
 * Handles user input for value, category, and unit selection
 */
export function InputPanel({
  value,
  unit,
  category,
  onValueChange,
  onUnitChange,
  onCalculatorValue,
}: InputPanelProps) {
  // Get current category data
  const selectedCategory = unitCategories.find((c) => c.id === category);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Category Selection */}
      <CategorySelector
        selectedCategory={category}
        onCategoryChange={(categoryId: string) => {
          // This will be handled by parent component to reset unit
          const newCategory = unitCategories.find((c) => c.id === categoryId);
          const firstUnit = newCategory?.groups[0]?.units[0];
          if (firstUnit) {
            onUnitChange(firstUnit.id);
          }
        }}
      />

      {/* Value Input */}
      <div className="space-y-2">
        <Label htmlFor="input-value">Value</Label>
        <div className="flex items-center">
          <Input
            id="input-value"
            type="number"
            placeholder="Enter value..."
            value={value || ""}
            onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
            className="text-lg"
          />
          <ScientificCalculator onValueSelect={onCalculatorValue} />
        </div>
      </div>

      {/* Unit Selection */}
      <div className="space-y-2">
        <Label htmlFor="input-unit">From Unit</Label>
        <UnitCombobox
          value={unit}
          onValueChange={onUnitChange}
          groups={selectedCategory?.groups || []}
          placeholder="Select unit..."
          className="w-full"
        />
      </div>
    </div>
  );
}
