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
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Focus,
  Plus,
  Sparkles,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OutputPanelProps,
  ResultRowProps,
  CustomConversionRowProps,
} from "../types";
import { unitCategories } from "../lib/data";
import { executeCustomFormula } from "../lib/utils";
import { toast } from "sonner";

/**
 * Output Panel Component
 * Displays conversion results with external input source above table
 */
export function OutputPanel({
  results,
  focusedUnits,
  showAllUnits,
  customConversions,
  inputValue,
  inputUnit,
  category,
  onToggleFocus,
  onCopyValue,
  onSwapUnits,
  onToggleShowAll,
  onCreateCustom,
  onInputValueChange,
  onInputUnitChange,
}: OutputPanelProps) {
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

  const selectedUnit = allUnits.find((u) => u.id === inputUnit);

  const displayResults = showAllUnits ? results : results.slice(0, 8);
  const displayCustomConversions = showAllUnits
    ? customConversions
    : customConversions.slice(0, 2);

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
          onChange={(e) => onInputValueChange(parseFloat(e.target.value) || 0)}
          className="w-full h-10 rounded-md border border-input bg-background pl-16 pr-30 text-right text-lg font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                className="h-8 w-full px-2 text-xs border-0 bg-transparent hover:bg-muted/50 justify-center"
              >
                {selectedUnit ? (
                  <span className="font-medium text-primary truncate">
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
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Show All/Less Button - Only show if there are more than 8 results */}
      {results.length > 8 && (
        <div className="flex items-center justify-center">
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
        </div>
      )}

      {/* Conversion Results Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Unit</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
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
              (results.length > 8 || customConversions.length > 2) && (
                <TableRow className="hover:bg-muted/30">
                  <TableCell colSpan={3} className="text-center py-4">
                    <Button variant="ghost" size="sm" onClick={onToggleShowAll}>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show{" "}
                      {results.length -
                        8 +
                        Math.max(0, customConversions.length - 2)}{" "}
                      more units
                    </Button>
                  </TableCell>
                </TableRow>
              )}

            {/* Custom Conversion Creation Row - Simplified single line */}
            <TableRow
              className="hover:bg-muted/50 cursor-pointer transition-colors border-t-2 border-dashed border-muted"
              onClick={onCreateCustom}
            >
              <TableCell colSpan={3} className="text-center py-3">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add Custom Unit</span>
                </div>
              </TableCell>
            </TableRow>
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
                    <TableHead className="w-[160px]">Custom Unit</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-[100px] text-center">
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
 * Displays a single conversion result with symbol prioritized
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
      {/* Unit Information - Symbol prioritized */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-bold text-base">{result.unit.symbol}</div>
            <div className="text-sm text-muted-foreground">
              {result.unit.name}
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
            {result.isApproximate && (
              <span className="text-muted-foreground mr-1">~</span>
            )}
            {result.formattedValue}
          </div>
          {result.scientificValue && (
            <div className="text-xs text-muted-foreground font-mono">
              {result.isApproximate && <span className="mr-1">~</span>}
              {result.scientificValue}
            </div>
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
    <TableRow className="group hover:bg-muted/30 transition-colors">
      {/* Custom Unit Information */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-sm flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-accent" />
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
            <div className="text-xs text-destructive">Error</div>
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
