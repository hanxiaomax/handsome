// Card components removed for cleaner design
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Calculator,
  Target,
  FlipHorizontal,
} from "lucide-react";
import type { Base, BitWidth } from "../types";

interface BitOperationsPanelProps {
  value: string;
  base: Base;
  bitWidth: BitWidth;
  onValueChange: (value: string) => void;
}

export function BitOperationsPanel({
  value,
  base,
  bitWidth,
}: BitOperationsPanelProps) {
  // Calculate bit statistics
  const decimal = parseInt(value || "0", base);
  const binary = decimal.toString(2).padStart(bitWidth, "0");
  const popCount = binary.split("1").length - 1; // Count of 1s
  const leadingZeros =
    binary.search("1") === -1 ? bitWidth : binary.search("1");
  const trailingZeros = binary.split("").reverse().join("").search("1");

  // TODO: Implement actual bit operations that use onValueChange
  const handleOperation = (operation: string) => {
    console.log(`Performing ${operation} operation`);
    // onValueChange will be used here in future implementation
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-5 w-5" />
          <h3 className="text-lg font-medium">Precision Bit Operations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Advanced bitwise operations and bit field manipulations
        </p>
      </div>
      {/* Basic Bitwise Operations */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Basic Bitwise Operations</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleOperation("AND")}
          >
            <span className="font-mono mr-2">AND</span>
            Bitwise AND
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleOperation("OR")}
          >
            <span className="font-mono mr-2">OR</span>
            Bitwise OR
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleOperation("XOR")}
          >
            <span className="font-mono mr-2">XOR</span>
            Bitwise XOR
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleOperation("NOT")}
          >
            <span className="font-mono mr-2">NOT</span>
            Bitwise NOT
          </Button>
        </div>
      </div>

      <Separator />

      {/* Bit Shift Operations */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Bit Shift Operations</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Logical Shifts</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleOperation("LSL")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                LSL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleOperation("LSR")}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                LSR
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Rotate Operations</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleOperation("ROL")}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                ROL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleOperation("ROR")}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                ROR
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm min-w-[4rem]">Positions:</Label>
          <Input
            type="number"
            min="1"
            max={bitWidth}
            placeholder="1"
            className="w-20"
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => handleOperation("APPLY_SHIFT")}
          >
            Apply
          </Button>
        </div>
      </div>

      <Separator />

      {/* Bit Field Operations */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Bit Field Operations</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Extract Bit Field</Label>
            <div className="flex items-center gap-2">
              <Input placeholder="Start" className="flex-1" />
              <Input placeholder="Length" className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOperation("EXTRACT")}
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Insert Bit Field</Label>
            <div className="flex items-center gap-2">
              <Input placeholder="Value" className="flex-1" />
              <Input placeholder="Position" className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOperation("INSERT")}
              >
                Insert
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Single Bit Operations</Label>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOperation("SET_BIT")}
            >
              Set Bit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOperation("CLEAR_BIT")}
            >
              Clear Bit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOperation("TOGGLE_BIT")}
            >
              Toggle Bit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOperation("TEST_BIT")}
            >
              Test Bit
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm min-w-[4rem]">Position:</Label>
            <Input
              type="number"
              min="0"
              max={bitWidth - 1}
              placeholder="0"
              className="w-20"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Bit Analysis & Statistics */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Bit Analysis & Statistics</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Population Count:</span>
              <Badge variant="secondary">{popCount}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leading Zeros:</span>
              <Badge variant="secondary">{leadingZeros}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trailing Zeros:</span>
              <Badge variant="secondary">
                {trailingZeros >= 0 ? trailingZeros : bitWidth}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MSB Position:</span>
              <Badge variant="secondary">{bitWidth - leadingZeros - 1}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LSB Position:</span>
              <Badge variant="secondary">
                {trailingZeros >= 0 ? trailingZeros : "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hamming Weight:</span>
              <Badge variant="secondary">{popCount}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Advanced Operations</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => handleOperation("BIT_REVERSE")}
            >
              <FlipHorizontal className="h-4 w-4 mr-2" />
              Bit Reverse
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => handleOperation("PARITY_CHECK")}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Parity Check
            </Button>
          </div>
        </div>
      </div>

      {/* Operation Result Preview */}
      <div className="p-4 rounded-lg border bg-muted/20">
        <Label className="text-sm font-medium mb-2 block">
          Operation Preview
        </Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-[4rem]">
              Original:
            </span>
            <code className="font-mono text-sm bg-background px-2 py-1 rounded flex-1">
              {binary}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-[4rem]">
              Result:
            </span>
            <code className="font-mono text-sm bg-primary/10 px-2 py-1 rounded flex-1">
              {binary}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
