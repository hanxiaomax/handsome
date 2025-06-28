import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Copy,
  Check,
  ChevronsUpDown,
  Focus,
  ArrowRightLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversionResult } from "../types";
import { MoreCard } from "./more-card";
import { CustomConversionDialog, type CustomConversion } from "./custom-conversion-dialog";

// Extended result type for custom conversions
interface ExtendedConversionResult extends ConversionResult {
  isCustom?: boolean;
  hasError?: boolean;
  customConversion?: CustomConversion;
}

interface OutputPanelProps {
  inputValue: string;
  inputUnit: string;
  availableUnits: Array<{ id: string; name: string; symbol: string }>;
  results: ConversionResult[];
  isProcessing: boolean;
  error: string | null;
  focusedUnits?: string[];
  selectedCategory?: string;
  customConversions?: CustomConversion[];
  onInputValueChange: (value: string) => void;
  onInputUnitChange: (unitId: string) => void;
  onToggleFocus?: (unitId: string) => void;
  onSwapUnits?: (result: ConversionResult) => void;
  onSaveCustomConversion?: (conversion: CustomConversion) => void;
  onEditCustomConversion?: (conversion: CustomConversion) => void;
  onDeleteCustomConversion?: (conversionId: string) => void;
}

export function OutputPanel({
  inputValue,
  inputUnit,
  availableUnits,
  results,
  isProcessing,
  error,
  focusedUnits = [],
  selectedCategory = "",
  customConversions = [],
  onInputValueChange,
  onInputUnitChange,
  onToggleFocus,
  onSwapUnits,
  onSaveCustomConversion,
  onEditCustomConversion,
  onDeleteCustomConversion,
}: OutputPanelProps) {
  const [open, setOpen] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  // Calculate custom conversion results
  const customResults: ExtendedConversionResult[] = customConversions.map((conversion) => {
    let convertedValue = 0;
    let formattedValue = "0";
    let hasError = false;
    
    try {
      const inputVal = parseFloat(inputValue) || 0;
      if (conversion.isJavaScript) {
        const func = new Function('value', conversion.formula + '\nreturn convert(value);');
        convertedValue = func(inputVal);
      } else {
        const func = new Function('value', `return ${conversion.formula.replace(/x/g, 'value')};`);
        convertedValue = func(inputVal);
      }
      formattedValue = convertedValue.toFixed(6).replace(/\.?0+$/, '');
    } catch {
      hasError = true;
      formattedValue = "Error";
    }

    return {
      unit: {
        id: conversion.id,
        name: conversion.name,
        symbol: conversion.symbol,
        description: conversion.description,
        baseRatio: 1,
        isBaseUnit: false,
        precision: 6,
        context: "Custom conversion",
      },
      value: convertedValue,
      formattedValue,
      isApproximate: false,
      isCustom: true,
      hasError,
      customConversion: conversion,
    };
  });

  // Combine standard and custom results
  const allResults: ExtendedConversionResult[] = [
    ...results.map(r => ({ ...r, isCustom: false })),
    ...customResults
  ];

  const selectedUnit = availableUnits.find((u) => u.id === inputUnit);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleToggleFocus = (unitId: string) => {
    if (onToggleFocus) {
      onToggleFocus(unitId);
    }
  };

  const handleSwapUnits = (result: ConversionResult) => {
    if (onSwapUnits) {
      onSwapUnits(result);
    }
  };

  const handleCreateCustom = () => {
    setCustomDialogOpen(true);
  };

  const handleSaveCustomConversion = (conversion: CustomConversion) => {
    if (onSaveCustomConversion) {
      onSaveCustomConversion(conversion);
    }
  };

  const handleEditCustomConversion = (conversion: CustomConversion) => {
    if (onEditCustomConversion) {
      onEditCustomConversion(conversion);
    }
  };

  const handleDeleteCustomConversion = (conversionId: string) => {
    if (onDeleteCustomConversion) {
      onDeleteCustomConversion(conversionId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Source - Simple and direct without panel */}
      <div className="relative mb-6">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
          Input
        </div>
        <input
          type="number"
          value={inputValue || ""}
          onChange={(e) => onInputValueChange(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background pl-16 pr-32 text-right text-lg font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          min={0}
          placeholder="Enter value..."
        />
        <div className="absolute right-1 top-1 bottom-1 w-30">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="h-8 px-4 text-sm border-0 bg-transparent hover:bg-muted/30"
              >
                {selectedUnit ? (
                  <span className="font-semibold text-primary truncate text-left">
                    {selectedUnit.symbol}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">Unit</span>
                )}
                <ChevronsUpDown className="ml-1 h-5 w-5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search units..." />
                <CommandList>
                  <CommandEmpty>No unit found.</CommandEmpty>
                  <CommandGroup>
                    {availableUnits.map((unit) => (
                      <CommandItem
                        key={unit.id}
                        value={`${unit.name} ${unit.symbol}`}
                        onSelect={() => {
                          onInputUnitChange(unit.id);
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
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="text-center py-4 text-destructive bg-destructive/10 rounded-md">
          <p className="font-medium">Conversion Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Converting...</p>
        </div>
      )}

      {allResults.length === 0 && !isProcessing && !error && (
        <div className="text-center py-8 text-muted-foreground">
          {!selectedCategory ? (
            <>
              <p className="text-lg font-medium">Welcome to Unit Converter</p>
              <p className="text-sm mt-2">
                Select a category from the left panel to start converting units
              </p>
            </>
          ) : (
            <>
              <p>No conversion results available</p>
              <p className="text-sm">
                Try selecting a different category or unit
              </p>
            </>
          )}
        </div>
      )}

      {/* Conversion Results Table */}
      {allResults.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">
                  <div className="flex items-center gap-2">
                    <span>Unit</span>
                    <Badge variant="secondary" className="text-xs">
                      {allResults.length}
                    </Badge>
                  </div>
                </TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allResults.map((result) => {
                const isFocused = focusedUnits.includes(result.unit.id);
                const isCustom = result.isCustom || false;
                const hasError = result.hasError || false;
                const customConversion = result.customConversion;
                
                return (
                  <TableRow
                    key={result.unit.id}
                    className={`group hover:bg-muted/50 transition-colors ${
                      isFocused
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : ""
                    } ${hasError ? "bg-destructive/5" : ""}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-base">
                            {result.unit.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="space-y-1">
                        <div className="font-mono font-semibold text-base flex items-center justify-end gap-2">
                          <span className={hasError ? "text-destructive" : ""}>
                            {result.isApproximate && (
                              <span className="text-muted-foreground mr-1">
                                ~
                              </span>
                            )}
                            {result.formattedValue}
                          </span>
                          <span className="font-bold text-primary">
                            {result.unit.symbol}
                          </span>
                        </div>
                        {/* Show scientific notation for large/small values */}
                        {!hasError && (Math.abs(result.value) >= 1e6 ||
                          (Math.abs(result.value) < 0.001 &&
                            result.value !== 0)) && (
                          <div className="text-xs text-muted-foreground font-mono flex items-center justify-end gap-2">
                            <span>
                              {result.isApproximate && (
                                <span className="mr-1">~</span>
                              )}
                              {result.value.toExponential(3)}
                            </span>
                            <span className="text-muted-foreground">
                              {result.unit.symbol}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Focus Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFocus(result.unit.id)}
                          className="h-6 w-6 p-0"
                          title={isFocused ? "Remove focus" : "Focus unit"}
                        >
                          <Focus
                            className={`h-3 w-3 ${
                              isFocused
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        
                        {/* Standard conversion: Swap Button */}
                        {!isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSwapUnits(result)}
                            className="h-6 w-6 p-0"
                            title="Swap units"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* Custom conversion: Edit Button */}
                        {isCustom && customConversion && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCustomConversion(customConversion)}
                            className="h-6 w-6 p-0"
                            title="Edit conversion"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* Custom conversion: Delete Button */}
                        {isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomConversion(result.unit.id)}
                            className="h-6 w-6 p-0"
                            title="Delete conversion"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* Copy Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(result.formattedValue)}
                          className="h-6 w-6 p-0"
                          title="Copy value"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      

      {/* More Card - Show when category is selected */}
      {selectedCategory && (
        <div className="mt-3">
          <MoreCard onCreateCustom={handleCreateCustom} />
        </div>
      )}

      {/* Custom Conversion Dialog */}
      <CustomConversionDialog
        isOpen={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        onSave={handleSaveCustomConversion}
      />
    </div>
  );
}
