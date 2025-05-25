import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Base, BitWidth, CalculatorMode, AngleUnit } from "../types";

interface SettingsPanelProps {
  base: Base;
  bitWidth: BitWidth;
  mode: CalculatorMode;
  angleUnit: AngleUnit;
  memory: number;
  onBaseChange: (base: Base) => void;
  onBitWidthChange: (bitWidth: BitWidth) => void;
  onModeChange: (mode: CalculatorMode) => void;
  onAngleUnitChange: (unit: AngleUnit) => void;
}

export function SettingsPanel({
  base,
  bitWidth,
  mode,
  angleUnit,
  memory,
  onBaseChange,
  onBitWidthChange,
  onModeChange,
  onAngleUnitChange,
}: SettingsPanelProps) {
  const bases: { value: Base; label: string }[] = [
    { value: 2, label: "BIN" },
    { value: 8, label: "OCT" },
    { value: 10, label: "DEC" },
    { value: 16, label: "HEX" },
  ];

  const bitWidths: BitWidth[] = [8, 16, 32, 64];
  const modes: { value: CalculatorMode; label: string }[] = [
    { value: "programmer", label: "Programmer" },
    { value: "scientific", label: "Scientific" },
  ];
  const angleUnits: { value: AngleUnit; label: string }[] = [
    { value: "deg", label: "DEG" },
    { value: "rad", label: "RAD" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Selection */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Number Base
          </label>
          <div className="flex gap-1">
            {bases.map((baseOption) => (
              <Button
                key={baseOption.value}
                variant={base === baseOption.value ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onBaseChange(baseOption.value)}
              >
                {baseOption.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Bit Width Selection */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Bit Width
          </label>
          <div className="flex gap-1">
            {bitWidths.map((width) => (
              <Button
                key={width}
                variant={bitWidth === width ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onBitWidthChange(width)}
              >
                {width}
              </Button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Calculator Mode
          </label>
          <div className="flex gap-1">
            {modes.map((modeOption) => (
              <Button
                key={modeOption.value}
                variant={mode === modeOption.value ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onModeChange(modeOption.value)}
              >
                {modeOption.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Angle Unit Selection (for scientific mode) */}
        {mode === "scientific" && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Angle Unit
            </label>
            <div className="flex gap-1">
              {angleUnits.map((unit) => (
                <Button
                  key={unit.value}
                  variant={angleUnit === unit.value ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => onAngleUnitChange(unit.value)}
                >
                  {unit.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Memory Status */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Memory
          </label>
          <div className="flex items-center gap-2">
            <Badge variant={memory !== 0 ? "default" : "secondary"}>
              M: {memory}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {memory !== 0 ? "Value stored" : "Empty"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
