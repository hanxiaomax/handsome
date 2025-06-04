import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calculator } from "lucide-react";
import { ButtonGrid } from "./button-grid";
import type { Base, CalculatorMode, ButtonConfig } from "../types";

interface FloatingCalculatorProps {
  base: Base;
  mode: CalculatorMode;
  onButtonClick: (value: string, type: ButtonConfig["type"]) => void;
}

export function FloatingCalculator({
  base,
  mode,
  onButtonClick,
}: FloatingCalculatorProps) {
  const [open, setOpen] = useState(false);

  const handleButtonClick = (value: string, type: ButtonConfig["type"]) => {
    onButtonClick(value, type);
    // Close popover for certain actions
    if (type === "operation" && value === "=") {
      setOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 bg-primary hover:bg-primary/90"
            title="Open Calculator"
          >
            <Calculator className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 mr-4 mb-4" align="end" side="top">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">Programmer Calculator</h4>
              <p className="text-xs text-muted-foreground">
                Base {base} • {mode} mode
              </p>
            </div>

            {/* Calculator Grid */}
            <div className="w-full">
              <ButtonGrid
                base={base}
                mode={mode}
                onButtonClick={handleButtonClick}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
