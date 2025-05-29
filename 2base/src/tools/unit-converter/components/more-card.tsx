import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";

interface MoreCardProps {
  onCreateCustom: () => void;
}

export function MoreCard({ onCreateCustom }: MoreCardProps) {
  return (
    <Card
      className="group hover:shadow-md transition-all aspect-square border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer"
      onClick={onCreateCustom}
    >
      <CardContent className="p-3 h-full flex flex-col justify-center items-center text-center">
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-sm">More Units</h4>
            <p className="text-xs text-muted-foreground">
              Create custom conversions
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <Sparkles className="h-3 w-3" />
            <span>Add Custom</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
