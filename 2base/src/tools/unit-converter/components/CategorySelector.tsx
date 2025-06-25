import { Combobox } from "./combobox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CategorySelectorProps } from "../types";

/**
 * Category Selector Component
 * Provides both vertical panel with hierarchical menu and dropdown selection
 */
export function CategorySelector({
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["common"])
  );

  // Category options for combobox
  const categoryOptions = [
    { value: "length", label: "Length", icon: "L" },
    { value: "weight", label: "Weight", icon: "W" },
    { value: "temperature", label: "Temperature", icon: "T" },
    { value: "volume", label: "Volume", icon: "V" },
    { value: "area", label: "Area", icon: "A" },
    { value: "speed", label: "Speed", icon: "S" },
    { value: "time", label: "Time", icon: "T" },
    { value: "pressure", label: "Pressure", icon: "P" },
    { value: "energy", label: "Energy", icon: "E" },
    { value: "power", label: "Power", icon: "P" },
    { value: "data", label: "Data Storage", icon: "D" },
    { value: "angle", label: "Angle", icon: "A" },
    { value: "frequency", label: "Frequency", icon: "F" },
  ];

  // Common conversion categories organized hierarchically
  const commonCategories = [
    {
      id: "common",
      name: "Common",
      items: [
        {
          id: "length",
          name: "Length",
          description: "Distance, height, width",
        },
        { id: "weight", name: "Weight", description: "Mass and weight" },
        {
          id: "temperature",
          name: "Temperature",
          description: "Heat measurement",
        },
        { id: "volume", name: "Volume", description: "Liquid and capacity" },
      ],
    },
    {
      id: "measurement",
      name: "Measurement",
      items: [
        { id: "area", name: "Area", description: "Surface measurement" },
        { id: "speed", name: "Speed", description: "Velocity and pace" },
        { id: "time", name: "Time", description: "Duration and periods" },
      ],
    },
    {
      id: "scientific",
      name: "Scientific",
      items: [
        {
          id: "pressure",
          name: "Pressure",
          description: "Force per unit area",
        },
        { id: "energy", name: "Energy", description: "Work and heat energy" },
        { id: "power", name: "Power", description: "Energy per unit time" },
      ],
    },
    {
      id: "digital",
      name: "Digital",
      items: [
        {
          id: "data",
          name: "Data Storage",
          description: "File size and storage",
        },
        {
          id: "frequency",
          name: "Frequency",
          description: "Cycles per second",
        },
        { id: "angle", name: "Angle", description: "Geometric angles" },
      ],
    },
  ];

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Handle category selection from vertical panel
  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Dropdown Selector - Current Style */}
      <div id="category-dropdown" className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Quick Select
        </h4>
        <Combobox
          value={selectedCategory}
          onValueChange={onCategoryChange}
          options={categoryOptions}
          placeholder="Select category..."
          className="w-full"
        />
      </div>

      <Separator />

      {/* Vertical Panel - Hierarchical Menu */}
      <div id="category-vertical-panel" className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Browse Categories
        </h4>

        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-1">
            {commonCategories.map((section) => (
              <Collapsible
                key={section.id}
                open={expandedSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                {/* Section Header */}
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-8 px-2 font-medium text-sm hover:bg-muted/50"
                  >
                    <span>{section.name}</span>
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                {/* Section Content */}
                <CollapsibleContent className="space-y-1">
                  {section.items.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onClick={() => handleCategorySelect(item.id)}
                      className={`w-full justify-start h-auto p-2 ml-2 text-left hover:bg-muted/50 ${
                        selectedCategory === item.id
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-foreground"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
