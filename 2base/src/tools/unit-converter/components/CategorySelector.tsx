import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronRight, ChevronDown, Search, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CategorySelectorProps } from "../types";

/**
 * Category Selector Component
 * Provides both vertical panel with hierarchical menu and dropdown selection
 */
export function CategorySelector({
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  // State for collapsible sections - only one can be expanded at a time
  const [expandedSection, setExpandedSection] = useState<string>("common");

  // State for search popover
  const [searchOpen, setSearchOpen] = useState(false);

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

  // Toggle section expansion - mutually exclusive
  const toggleSection = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(""); // Collapse current section
    } else {
      setExpandedSection(sectionId); // Expand new section, auto-collapse others
    }
  };

  // Handle category selection from vertical panel
  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  // Handle category selection from search dropdown
  const handleSearchSelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setSearchOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Vertical Panel - Hierarchical Menu with Mutual Exclusion */}
      <div id="category-vertical-panel" className="space-y-2">
        {/* Header with Browse Categories title and Search button */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">
            Browse Categories
          </h4>

          {/* Search Icon Selector */}
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="w-8 h-8 p-0 rounded-full"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search categories</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {categoryOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={`${option.label} ${option.value}`}
                        onSelect={() => handleSearchSelect(option.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCategory === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <span className="text-muted-foreground text-sm">
                            {option.icon}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-1">
            {commonCategories.map((section) => (
              <Collapsible
                key={section.id}
                open={expandedSection === section.id}
                onOpenChange={() => toggleSection(section.id)}
              >
                {/* Section Header */}
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-8 px-2 font-medium text-sm hover:bg-muted/50"
                  >
                    <span>{section.name}</span>
                    {expandedSection === section.id ? (
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
