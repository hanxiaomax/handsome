"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToolLayout } from "@/components/layout/tool-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, ChevronDown, ChevronUp, ArrowRightLeft, Focus } from "lucide-react";
import { toast } from "sonner";
import { useMinimizedTools } from "@/contexts/minimized-tools-context";
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
  const navigate = useNavigate();
  const { minimizeTool } = useMinimizedTools();
  const [state, setState] = useState<ConverterState>(initialState);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Window control handlers
  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleMinimize = useCallback(() => {
    minimizeTool(toolInfo);
  }, [minimizeTool]);

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

  // Get current category data
  const selectedCategory = unitCategories.find((c) => c.id === state.selectedCategory);

  // Prepare combobox options for categories
  const categoryOptions = unitCategories.map((category) => ({
    value: category.id,
    label: category.name,
    icon: category.icon,
  }));

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onClose={handleClose}
      onMinimize={handleMinimize}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
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
              {state.results.length > 8 && (
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {(state.showAllUnits ? state.results : state.results.slice(0, 8)).map((result) => (
                <ResultCard
                  key={result.unit.id}
                  result={result}
                  isFocused={state.favorites.includes(result.unit.id)}
                  onToggleFocus={() => handleToggleFocus(result.unit.id)}
                  onCopyValue={() => handleCopyValue(result.formattedValue)}
                  onSwapUnits={() => handleSwapUnits(result)}
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
    </ToolLayout>
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
      <CardContent className="p-3 h-full flex flex-col justify-between">
        {/* Header with unit name and actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{result.unit.name}</h4>
            <p className="text-xs text-muted-foreground">{result.unit.symbol}</p>
          </div>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFocus}
              className="h-5 w-5 p-0"
              title={isFocused ? "Remove focus" : "Focus unit"}
            >
              <Focus className={`h-3 w-3 ${isFocused ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwapUnits}
              className="h-5 w-5 p-0"
              title="Swap units"
            >
              <ArrowRightLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopyValue}
              className="h-5 w-5 p-0"
              title="Copy value"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Value display */}
        <div className="space-y-1 flex-1 flex flex-col justify-center">
          <p className="font-mono text-base font-semibold truncate" title={result.formattedValue}>
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