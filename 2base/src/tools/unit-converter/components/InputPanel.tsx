import { Label } from "@/components/ui/label";
import { CategorySelector } from "./CategorySelector";
import { UnitCombobox } from "./combobox";
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
  onCategoryChange,
}: InputPanelProps) {
  // Get current category data
  const selectedCategory = unitCategories.find((c) => c.id === category);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Category Selection */}
      <CategorySelector
        selectedCategory={category}
        onCategoryChange={onCategoryChange}
      />

      {/* Value Input with Calculator */}
      <div className="space-y-2">
        <Label htmlFor="input-value">Value</Label>
        <div className="flex items-center gap-2">
          <input
            id="input-value"
            type="number"
            value={value || ""}
            onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
            placeholder="Enter value..."
            className="flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            min={0}
          />
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
