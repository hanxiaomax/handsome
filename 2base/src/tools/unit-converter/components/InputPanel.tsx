import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputPanelProps } from "../types";
import { unitCategories } from "../lib/data";

/**
 * Input Panel Component
 * Handles user input for value and unit selection with integrated design
 */
export function InputPanel({
  value,
  unit,
  category,
  onValueChange,
  onUnitChange,
}: InputPanelProps) {
  const [open, setOpen] = useState(false);

  // Get current category data
  const selectedCategory = unitCategories.find((c) => c.id === category);

  // Flatten all units for searching
  const allUnits =
    selectedCategory?.groups.flatMap((group) =>
      group.units.map((unit) => ({
        ...unit,
        groupName: group.name,
      }))
    ) || [];

  const selectedUnit = allUnits.find((u) => u.id === unit);

  return (
    <div className="space-y-4">
      <Label htmlFor="integrated-input" className="text-base font-medium">
        Enter Value
      </Label>

      {/* Integrated Input with Unit Selector */}
      <div className="relative">
        <input
          id="integrated-input"
          type="number"
          value={value || ""}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          placeholder="Enter value..."
          className="w-full h-12 rounded-md border border-input bg-background pl-4 pr-20 py-2 text-lg font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          min={0}
        />

        {/* Unit Selector Button - Positioned inside input on the right */}
        <div className="absolute right-1 top-1 bottom-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="h-10 px-3 text-sm border-0 bg-transparent hover:bg-muted/50"
              >
                {selectedUnit ? (
                  <span className="font-medium text-primary">
                    {selectedUnit.symbol}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Unit</span>
                )}
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search units..." />
                <CommandList>
                  <CommandEmpty>No unit found.</CommandEmpty>
                  {selectedCategory?.groups.map((group) => (
                    <CommandGroup key={group.id} heading={group.name}>
                      {group.units.map((unit) => (
                        <CommandItem
                          key={unit.id}
                          value={`${unit.name} ${unit.symbol} ${group.name}`}
                          onSelect={() => {
                            onUnitChange(unit.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              unit.id === selectedUnit?.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex items-center justify-between w-full">
                            <span>{unit.name}</span>
                            <span className="text-muted-foreground text-sm">
                              {unit.symbol}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
