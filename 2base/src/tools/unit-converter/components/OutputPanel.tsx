import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Focus,
  Plus,
  Sparkles,
} from "lucide-react";
import type {
  OutputPanelProps,
  ResultRowProps,
  CustomConversionRowProps,
} from "../types";
import { executeCustomFormula } from "../lib/utils";
import { toast } from "sonner";

/**
 * Output Panel Component
 * Displays conversion results in a clean table layout
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

  const displayResults = showAllUnits ? results : results.slice(0, 12);
  const displayCustomConversions = showAllUnits
    ? customConversions
    : customConversions.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Conversion Results</Label>
        <div className="flex items-center gap-2">
          {results.length > 12 && (
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
          <Button variant="outline" size="sm" onClick={onCreateCustom}>
            <Plus className="h-4 w-4 mr-1" />
            Custom
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Unit</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Regular conversion results */}
            {displayResults.map((result) => (
              <ResultRow
                key={result.unit.id}
                result={result}
                isFocused={focusedUnits.includes(result.unit.id)}
                onToggleFocus={() => onToggleFocus(result.unit.id)}
                onCopyValue={() => onCopyValue(result.formattedValue)}
                onSwapUnits={() => onSwapUnits(result)}
              />
            ))}

            {/* Custom Conversions */}
            {displayCustomConversions.map((conversion) => (
              <CustomConversionRow
                key={conversion.id}
                conversion={conversion}
                inputValue={inputValue}
              />
            ))}

            {/* Show more row when not expanded */}
            {!showAllUnits &&
              (results.length > 12 || customConversions.length > 3) && (
                <TableRow className="hover:bg-muted/30">
                  <TableCell colSpan={3} className="text-center py-4">
                    <Button variant="ghost" size="sm" onClick={onToggleShowAll}>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show{" "}
                      {results.length -
                        12 +
                        Math.max(0, customConversions.length - 3)}{" "}
                      more units
                    </Button>
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>

      {/* Custom conversions section when expanded */}
      {showAllUnits &&
        customConversions.length > displayCustomConversions.length && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Additional Custom Conversions
            </Label>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Custom Unit</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-[120px] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customConversions
                    .slice(displayCustomConversions.length)
                    .map((conversion) => (
                      <CustomConversionRow
                        key={conversion.id}
                        conversion={conversion}
                        inputValue={inputValue}
                      />
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
    </div>
  );
}

/**
 * Result Row Component
 * Displays a single conversion result in table row format
 */
function ResultRow({
  result,
  isFocused,
  onToggleFocus,
  onCopyValue,
  onSwapUnits,
}: ResultRowProps) {
  return (
    <TableRow
      className={`group hover:bg-muted/50 transition-colors ${
        isFocused ? "bg-primary/5 border-l-2 border-l-primary" : ""
      }`}
    >
      {/* Unit Information */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-sm">{result.unit.name}</div>
            <div className="text-xs text-muted-foreground">
              {result.unit.symbol}
            </div>
          </div>
          {isFocused && (
            <Badge variant="secondary" className="text-xs">
              Focused
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Value Display */}
      <TableCell className="text-right">
        <div className="space-y-1">
          <div
            className="font-mono font-semibold text-sm"
            title={result.formattedValue}
          >
            {result.formattedValue}
          </div>
          {result.scientificValue && (
            <div className="text-xs text-muted-foreground font-mono">
              {result.scientificValue}
            </div>
          )}
          {result.isApproximate && (
            <Badge variant="outline" className="text-xs">
              ~
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFocus}
            className="h-8 w-8 p-0"
            title={isFocused ? "Remove focus" : "Focus unit"}
          >
            <Focus
              className={`h-3 w-3 ${
                isFocused ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwapUnits}
            className="h-8 w-8 p-0"
            title="Swap units"
          >
            <ArrowRightLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyValue}
            className="h-8 w-8 p-0"
            title="Copy value"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Custom Conversion Row Component
 * Displays a custom conversion result in table row format
 */
function CustomConversionRow({
  conversion,
  inputValue,
}: CustomConversionRowProps) {
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
    <TableRow className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-950/20 dark:hover:to-blue-950/20 transition-colors">
      {/* Custom Unit Information */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-sm flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              {conversion.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {conversion.symbol}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Custom
          </Badge>
        </div>
      </TableCell>

      {/* Value Display */}
      <TableCell className="text-right">
        <div className="space-y-1">
          {error ? (
            <div className="text-xs text-red-500">Error</div>
          ) : result !== null ? (
            <div className="font-mono font-semibold text-sm">
              {result.toFixed(3)}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Calculating...</div>
          )}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy value"
            disabled={result === null}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
