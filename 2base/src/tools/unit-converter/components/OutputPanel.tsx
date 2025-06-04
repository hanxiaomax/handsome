import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Focus,
} from "lucide-react";
import { MoreCard } from "./more-card";
import type {
  OutputPanelProps,
  ResultCardProps,
  CustomConversionCardProps,
} from "../types";
import { executeCustomFormula } from "../lib/utils";
import { toast } from "sonner";

/**
 * Output Panel Component
 * Displays conversion results in a grid layout
 */
export function OutputPanel({
  results,
  focusedUnits,
  showAllUnits,
  customConversions,
  inputValue,
  onToggleFocus,
  onCopyValue,
  onSwapUnits,
  onToggleShowAll,
  onCreateCustom,
}: OutputPanelProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Conversion Results</Label>
        {results.length > 7 && (
          <Button variant="ghost" size="sm" onClick={onToggleShowAll}>
            {showAllUnits ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All ({results.length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {/* Regular conversion results */}
        {(showAllUnits ? results : results.slice(0, 6)).map((result) => (
          <ResultCard
            key={result.unit.id}
            result={result}
            isFocused={focusedUnits.includes(result.unit.id)}
            onToggleFocus={() => onToggleFocus(result.unit.id)}
            onCopyValue={() => onCopyValue(result.formattedValue)}
            onSwapUnits={() => onSwapUnits(result)}
          />
        ))}

        {/* Custom Conversions - show when not displaying all units */}
        {!showAllUnits &&
          customConversions
            .slice(0, 1)
            .map((conversion) => (
              <CustomConversionCard
                key={conversion.id}
                conversion={conversion}
                inputValue={inputValue}
              />
            ))}

        {/* More Card - always show when there are results and not showing all */}
        {!showAllUnits && <MoreCard onCreateCustom={onCreateCustom} />}
      </div>

      {/* Show all custom conversions when expanded */}
      {showAllUnits && customConversions.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Custom Conversions</Label>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {customConversions.map((conversion) => (
              <CustomConversionCard
                key={conversion.id}
                conversion={conversion}
                inputValue={inputValue}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Result Card Component
 * Displays a single conversion result
 */
function ResultCard({
  result,
  isFocused,
  onToggleFocus,
  onCopyValue,
  onSwapUnits,
}: ResultCardProps) {
  return (
    <Card
      className={`group hover:shadow-md transition-all aspect-square ${
        isFocused ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <CardContent className="p-2 h-full flex flex-col justify-between">
        {/* Header with unit name and actions */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-xs truncate">{result.unit.name}</h4>
            <p className="text-xs text-destructive font-semibold">
              {result.unit.symbol}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFocus}
              className="h-4 w-4 p-0"
              title={isFocused ? "Remove focus" : "Focus unit"}
            >
              <Focus
                className={`h-2.5 w-2.5 ${
                  isFocused ? "text-primary" : "text-muted-foreground"
                }`}
              />
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
          <p
            className="font-mono text-sm font-semibold truncate"
            title={result.formattedValue}
          >
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

/**
 * Custom Conversion Card Component
 * Displays a custom conversion result
 */
function CustomConversionCard({
  conversion,
  inputValue,
}: CustomConversionCardProps) {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { result: conversionResult, error: conversionError } =
      executeCustomFormula(
        conversion.formula,
        inputValue,
        conversion.isJavaScript
      );
    setResult(conversionResult);
    setError(conversionError);
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
