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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ConversionResult } from "../types";
import { MoreCard } from "./more-card";
import { CustomConversionDialog, type CustomConversion } from "./custom-conversion-dialog";

// Extended result type for custom conversions
interface ExtendedConversionResult extends ConversionResult {
  isCustom?: boolean;
  hasError?: boolean;
  customConversion?: CustomConversion;
  needsScientific?: boolean;
  scientificValue?: string;
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

// Helper function to format numbers and determine if scientific notation is needed
const formatNumber = (value: number, hasError: boolean = false) => {
  if (hasError || isNaN(value) || !isFinite(value)) {
    return {
      originalValue: "Error",
      formattedValue: "Error",
      needsScientific: false,
      scientificValue: ""
    };
  }

  // Convert to string to check digit count
  const originalStr = value.toString();

  // Remove decimal point and scientific notation for digit counting
  const digitsOnly = originalStr.replace(/[.-]/g, '').replace(/e[+-]?\d+/i, '');
  const hasMoreThan11Digits = digitsOnly.length > 11;
  
  // Format the original value (clean up trailing zeros)
  let formattedValue = value.toFixed(6).replace(/\.?0+$/, '');
  
  // If the formatted value is still very long, use a more reasonable precision
  if (formattedValue.length > 15) {
    formattedValue = value.toPrecision(6);
  }
  
  return {
    originalValue: formattedValue,
    formattedValue,
    needsScientific: hasMoreThan11Digits,
    scientificValue: hasMoreThan11Digits ? value.toExponential(3) : ""
  };
};

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
    } catch {
      hasError = true;
    }

    const numberFormat = formatNumber(convertedValue, hasError);

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
      formattedValue: numberFormat.formattedValue,
      isApproximate: false,
      isCustom: true,
      hasError,
      customConversion: conversion,
      needsScientific: numberFormat.needsScientific,
      scientificValue: numberFormat.scientificValue,
    };
  });

  // Combine standard and custom results
  const standardResults: ExtendedConversionResult[] = results.map(r => {
    const numberFormat = formatNumber(r.value);
    return {
      ...r,
      isCustom: false,
      formattedValue: numberFormat.formattedValue,
      needsScientific: numberFormat.needsScientific,
      scientificValue: numberFormat.scientificValue
    };
  });
  
  const allResults: ExtendedConversionResult[] = [
    ...standardResults,
    ...customResults
  ];

  // Sort results: focused units first, then others
  const sortedResults = allResults.sort((a, b) => {
    const aIsFocused = focusedUnits.includes(a.unit.id);
    const bIsFocused = focusedUnits.includes(b.unit.id);
    
    if (aIsFocused && !bIsFocused) return -1;
    if (!aIsFocused && bIsFocused) return 1;
    
    // If both are focused or both are not focused, maintain original order
    return 0;
  });

  const selectedUnit = availableUnits.find((u) => u.id === inputUnit);

  const handleCopy = async (value: string, unitName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Copied ${unitName} value`, {
        description: `${value} copied to clipboard`
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleToggleFocus = (unitId: string, unitName: string) => {
    if (onToggleFocus) {
      onToggleFocus(unitId);
      const isFocused = focusedUnits.includes(unitId);
      if (isFocused) {
        toast.info(`Removed focus from ${unitName}`);
      } else {
        toast.success(`Focused on ${unitName}`, {
          description: "This unit will appear at the top of the list"
        });
      }
    }
  };

  const handleSwapUnits = (result: ConversionResult) => {
    if (onSwapUnits) {
      onSwapUnits(result);
      toast.success(`Swapped to ${result.unit.name}`, {
        description: `Input unit changed to ${result.unit.name}`
      });
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
      toast.success("Custom conversion deleted");
    }
  };

  const handleClearInput = () => {
    onInputValueChange("");
    toast.info("Input cleared");
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
          className="w-full h-10 rounded-md border border-input bg-background pl-16 pr-40 text-right text-lg font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          min={0}
          placeholder="Enter value..."
        />
        <div className="absolute right-1 top-1 bottom-1 flex items-center">
          {/* Unit Selector */}
          <div className="w-30">
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
          
          {/* Clear Button - 在最右侧 */}
          {inputValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearInput}
              className="h-8 w-8 p-0 hover:bg-muted/30 ml-1"
              title="Clear input"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
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

      {sortedResults.length === 0 && !isProcessing && !error && (
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
      {sortedResults.length > 0 && (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead className="w-[160px]">
                  <div className="flex items-center gap-2">
                    <span>Unit</span>
                    <Badge variant="secondary" className="text-xs">
                      {sortedResults.length}
                    </Badge>
                </div>
                </TableHead>
                    <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {sortedResults.map((result) => {
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
                        {/* Show scientific notation when number has more than 11 digits */}
                        {!hasError && result.needsScientific && result.scientificValue && (
                          <div className="text-xs text-muted-foreground font-mono flex items-center justify-end gap-2">
                            <span>
                              {result.isApproximate && (
                                <span className="mr-1">~</span>
                              )}
              {result.scientificValue}
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
                          onClick={() => handleToggleFocus(result.unit.id, result.unit.name)}
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
                          onClick={() => handleCopy(result.formattedValue, result.unit.name)}
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
