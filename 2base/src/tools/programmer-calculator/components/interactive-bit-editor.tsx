import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Base, BitWidth } from "../types";

interface InteractiveBitEditorProps {
  value: string;
  base: Base;
  bitWidth: BitWidth;
  onValueChange: (value: string) => void;
}

export function InteractiveBitEditor({
  value,
  base,
  bitWidth,
}: InteractiveBitEditorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Bit View & Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
          <span className="text-muted-foreground">
            Interactive Bit Editor - Coming Soon
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Advanced bit manipulation with visual feedback - Value: {value}, Base:{" "}
          {base}, BitWidth: {bitWidth}
        </p>
      </CardContent>
    </Card>
  );
}
