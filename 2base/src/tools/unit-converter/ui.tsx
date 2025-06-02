"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, ChevronDown, ChevronUp, ArrowRightLeft, Focus } from "lucide-react";
import { toast } from "sonner";
import {
  UnitConverter as UnitConverterEngine,
  unitCategories,
  debounce,
  type ConverterState,
  type ConversionResult,
} from "./lib";
import { toolInfo } from "./toolInfo";
import { ScientificCalculator } from "./components/calculator";
import { Combobox, UnitCombobox } from "./components/combobox";
import { KeyboardShortcuts, QuickTips } from "./components/tips";
import { MoreCard } from "./components/more-card";
import { CustomConversionDialog, type CustomConversion } from "./components/custom-conversion-dialog";

// Initial state - replace favorites with focusedUnits
const initialState: ConverterState = {
  selectedCategory: "length",
  inputValue: 1,
  inputUnit: "meter",
  results: [],
  conversionInfo: {
    formula: "",
    explanation: "",
    precision: "",
  },
  favorites: [], // Now used for focused units
  showAllUnits: false,
  compactMode: false,
};

export default function UnitConverter() {
  const [state, setState] = useState<ConverterState>(initialState);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customConversions, setCustomConversions] = useState<CustomConversion[]>([]);
  const converter = useRef(new UnitConverterEngine(unitCategories));

  // Initialize conversions on component mount
  useEffect(() => {
    const initialResults = converter.current.convertToAll(
      initialState.inputValue,
      initialState.inputUnit,
      initialState.selectedCategory
    );

    setState((s) => ({
      ...s,
      results: initialResults,
    }));
  }, []);



  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Real-time conversion with debouncing
  const debouncedConvert = useMemo(
    () =>
      debounce((value: number, unitId: string, categoryId: string) => {
        if (value && unitId && categoryId) {
          const results = converter.current.convertToAll(value, unitId, categoryId);
          setState((s) => ({ ...s, results }));
        }
      }, 150),
    []
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (value: number) => {
      setState((s) => ({ ...s, inputValue: value }));
      debouncedConvert(value, state.inputUnit, state.selectedCategory);
    },
    [state.inputUnit, state.selectedCategory, debouncedConvert]
  );

  // Handle unit change
  const handleInputUnitChange = useCallback(
    (unitId: string) => {
      setState((s) => ({ ...s, inputUnit: unitId }));
      debouncedConvert(state.inputValue, unitId, state.selectedCategory);
    },
    [state.inputValue, state.selectedCategory, debouncedConvert]
  );

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string) => {
    const category = unitCategories.find((c) => c.id === categoryId);
    const firstUnit = category?.groups[0]?.units[0];

    setState((s) => ({
      ...s,
      selectedCategory: categoryId,
      inputUnit: firstUnit?.id || "",
      inputValue: 1,
      results: [],
      favorites: [], // Clear focused units when switching categories
    }));

    if (firstUnit) {
      const results = converter.current.convertToAll(1, firstUnit.id, categoryId);
      setState((s) => ({ ...s, results }));
    }
  }, []);

  // Handle copy value
  const handleCopyValue = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Value copied to clipboard");
  }, []);

  // Handle focus toggle (replaces favorites)
  const handleToggleFocus = useCallback((unitId: string) => {
    setState((s) => {
      const isFocused = s.favorites.includes(unitId);
      const newFocused = isFocused
        ? s.favorites.filter((id) => id !== unitId)
        : [unitId, ...s.favorites]; // Add to beginning

      // Re-sort results to put focused units first
      const focusedResults = s.results.filter(r => newFocused.includes(r.unit.id));
      const unfocusedResults = s.results.filter(r => !newFocused.includes(r.unit.id));
      const sortedResults = [...focusedResults, ...unfocusedResults];

      return {
        ...s,
        favorites: newFocused,
        results: sortedResults,
      };
    });

    const unitName = state.results.find(r => r.unit.id === unitId)?.unit.name;
    toast.success(state.favorites.includes(unitId) 
      ? `Removed ${unitName} from focus` 
      : `Focused on ${unitName}`);
  }, [state.favorites, state.results]);

  // Handle swap units
  const handleSwapUnits = useCallback((targetUnit: ConversionResult) => {
    const convertedValue = converter.current.convert(
      state.inputValue,
      state.inputUnit,
      targetUnit.unit.id
    );

    setState((s) => ({
      ...s,
      inputUnit: targetUnit.unit.id,
      inputValue: convertedValue,
    }));

    debouncedConvert(convertedValue, targetUnit.unit.id, state.selectedCategory);
    toast.success(`Swapped to ${targetUnit.unit.name}`);
  }, [state.inputValue, state.inputUnit, state.selectedCategory, debouncedConvert]);

  // Handle calculator value selection
  const handleCalculatorValue = useCallback((value: number) => {
    setState((s) => ({ ...s, inputValue: value }));
    debouncedConvert(value, state.inputUnit, state.selectedCategory);
    toast.success(`Value set to ${value}`);
  }, [state.inputUnit, state.selectedCategory, debouncedConvert]);

  // Handle custom conversion creation
  const handleCreateCustom = useCallback(() => {
    setCustomDialogOpen(true);
  }, []);

  // Handle save custom conversion
  const handleSaveCustomConversion = useCallback((conversion: CustomConversion) => {
    setCustomConversions(prev => [...prev, conversion]);
    toast.success(`Custom conversion "${conversion.name}" added!`);
  }, []);

  // Get current category data
  const selectedCategory = unitCategories.find((c) => c.id === state.selectedCategory);

  // Prepare combobox options for categories
  const categoryOptions = unitCategories.map((category) => ({
    value: category.id,
    label: category.name,
    icon: category.icon,
  }));

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ converterState: state }}>
    
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category-select">Category</Label>
            <Combobox
              value={state.selectedCategory}
              onValueChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="Select category..."
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="input-value">Value</Label>
            <div className="flex items-center">
              <Input
                id="input-value"
                type="number"
                placeholder="Enter value..."
                value={state.inputValue || ""}
                onChange={(e) => handleInputChange(parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <ScientificCalculator onValueSelect={handleCalculatorValue} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="input-unit">From Unit</Label>
            <UnitCombobox
              value={state.inputUnit}
              onValueChange={handleInputUnitChange}
              groups={selectedCategory?.groups || []}
              placeholder="Select unit..."
              className="w-full"
            />
          </div>
        </div>

        {/* Results Grid */}
        {state.results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Conversion Results</Label>
              {state.results.length > 7 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState((s) => ({ ...s, showAllUnits: !s.showAllUnits }))}
                >
                  {state.showAllUnits ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show All ({state.results.length})
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {/* Show regular conversion results - limit to 6 when not showing all to leave room for custom conversions and More card */}
              {(state.showAllUnits ? state.results : state.results.slice(0, 6)).map((result) => (
                <ResultCard
                  key={result.unit.id}
                  result={result}
                  isFocused={state.favorites.includes(result.unit.id)}
                  onToggleFocus={() => handleToggleFocus(result.unit.id)}
                  onCopyValue={() => handleCopyValue(result.formattedValue)}
                  onSwapUnits={() => handleSwapUnits(result)}
                />
              ))}
              
              {/* Custom Conversions - show when not displaying all units */}
              {!state.showAllUnits && customConversions.slice(0, 1).map((conversion) => (
                <CustomConversionCard
                  key={conversion.id}
                  conversion={conversion}
                  inputValue={state.inputValue}
                />
              ))}
              
              {/* More Card - always show when there are results and not showing all */}
              {!state.showAllUnits && <MoreCard onCreateCustom={handleCreateCustom} />}
            </div>
          </div>
        )}

        {/* Show all custom conversions when expanded or when there are many */}
        {state.showAllUnits && customConversions.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Custom Conversions</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {customConversions.map((conversion) => (
                <CustomConversionCard
                  key={conversion.id}
                  conversion={conversion}
                  inputValue={state.inputValue}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tips and Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KeyboardShortcuts />
          <QuickTips />
        </div>
      </div>

      {/* Custom Conversion Dialog */}
      <CustomConversionDialog
        isOpen={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        onSave={handleSaveCustomConversion}
      />
    </ToolWrapper>
  );
}

// Compact Square Result Card Component
interface ResultCardProps {
  result: ConversionResult;
  isFocused: boolean;
  onToggleFocus: () => void;
  onCopyValue: () => void;
  onSwapUnits: () => void;
}

function ResultCard({ result, isFocused, onToggleFocus, onCopyValue, onSwapUnits }: ResultCardProps) {
  return (
    <Card className={`group hover:shadow-md transition-all aspect-square ${
      isFocused ? 'ring-2 ring-primary bg-primary/5' : ''
    }`}>
      <CardContent className="p-2 h-full flex flex-col justify-between">
        {/* Header with unit name and actions */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-xs truncate">{result.unit.name}</h4>
            <p className="text-xs text-destructive font-semibold">{result.unit.symbol}</p>
          </div>
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFocus}
              className="h-4 w-4 p-0"
              title={isFocused ? "Remove focus" : "Focus unit"}
            >
              <Focus className={`h-2.5 w-2.5 ${isFocused ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwapUnits}
              className="h-4 w-4 p-0"
              title="Swap units"
            >
              <ArrowRightLeft className="h-2.5 w-2.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopyValue}
              className="h-4 w-4 p-0"
              title="Copy value"
            >
              <Copy className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>

        {/* Value display */}
        <div className="space-y-1 flex-1 flex flex-col justify-center">
          <p className="font-mono text-sm font-semibold truncate" title={result.formattedValue}>
            {result.formattedValue}
          </p>
          {result.scientificValue && (
            <p className="text-xs text-muted-foreground font-mono truncate">
              {result.scientificValue}
            </p>
          )}
          {result.isApproximate && (
            <Badge variant="secondary" className="text-xs w-fit">
              ~
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Custom Conversion Card Component
interface CustomConversionCardProps {
  conversion: CustomConversion;
  inputValue: number;
}

function CustomConversionCard({ conversion, inputValue }: CustomConversionCardProps) {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (conversion.isJavaScript) {
        // Execute JavaScript conversion
        const func = new Function('value', conversion.formula + '\nreturn convert(value);');
        const converted = func(inputValue);
        setResult(converted);
        setError(null);
      } else {
        // Execute basic formula (replace x with value)
        const formula = conversion.formula.replace(/x/g, inputValue.toString());
        const converted = eval(formula);
        setResult(converted);
        setError(null);
      }
    } catch {
      setError('Conversion error');
      setResult(null);
    }
  }, [conversion, inputValue]);

  const handleCopy = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString());
      toast.success("Value copied to clipboard");
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all aspect-square bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardContent className="p-3 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{conversion.name}</h4>
            <p className="text-xs text-muted-foreground">{conversion.symbol}</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-5 w-5 p-0"
              title="Copy value"
              disabled={result === null}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Value display */}
        <div className="space-y-1 flex-1 flex flex-col justify-center">
          {error ? (
            <p className="text-xs text-red-500">Error</p>
          ) : result !== null ? (
            <p className="font-mono text-base font-semibold truncate">
              {result.toFixed(3)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Calculating...</p>
          )}
          <Badge variant="outline" className="text-xs w-fit">
            Custom
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 