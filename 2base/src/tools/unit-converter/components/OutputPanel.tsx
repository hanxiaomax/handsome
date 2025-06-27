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
import { Copy, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversionResult } from "../types";

interface OutputPanelProps {
  inputValue: string;
  inputUnit: string;
  availableUnits: Array<{ id: string; name: string; symbol: string }>;
  results: ConversionResult[];
  isProcessing: boolean;
  error: string | null;
  onInputValueChange: (value: string) => void;
  onInputUnitChange: (unitId: string) => void;
}

export function OutputPanel({
  inputValue,
  inputUnit,
  availableUnits,
  results,
  isProcessing,
  error,
  onInputValueChange,
  onInputUnitChange,
}: OutputPanelProps) {
  const [open, setOpen] = useState(false);

  const selectedUnit = availableUnits.find((u) => u.id === inputUnit);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy:", err);
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

      {results.length === 0 && !isProcessing && !error && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No conversion results available</p>
          <p className="text-sm">Try selecting a different category or unit</p>
        </div>
      )}

      {/* Conversion Results Table */}
      {results.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">
                  <div className="flex items-center gap-2">
                    <span>Unit</span>
                    <Badge variant="secondary" className="text-xs">
                      {results.length}
                    </Badge>
                  </div>
                </TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-[80px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.unit.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{result.unit.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.unit.symbol}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-lg font-semibold">
                        {result.formattedValue}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {result.unit.symbol}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.formattedValue)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
