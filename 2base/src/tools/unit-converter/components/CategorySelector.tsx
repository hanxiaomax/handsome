import { Combobox } from "./combobox";
import type { CategorySelectorProps } from "../types";

/**
 * Category Selector Component
 * Allows users to choose between different unit categories
 */
export function CategorySelector({
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  // Category options for combobox
  const categoryOptions = [
    { value: "length", label: "Length", icon: "L" },
    { value: "weight", label: "Weight", icon: "W" },
    { value: "temperature", label: "Temperature", icon: "T" },
    { value: "volume", label: "Volume", icon: "V" },
    { value: "area", label: "Area", icon: "A" },
    { value: "speed", label: "Speed", icon: "S" },
  ];

  return (
    <div className="space-y-2">
      <label htmlFor="category-select" className="text-sm font-medium">
        Category
      </label>
      <Combobox
        value={selectedCategory}
        onValueChange={onCategoryChange}
        options={categoryOptions}
        placeholder="Select category..."
        className="w-full"
      />
    </div>
  );
}
