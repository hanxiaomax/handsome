import { Plus } from "lucide-react";

interface MoreCardProps {
  onCreateCustom: () => void;
}

export function MoreCard({ onCreateCustom }: MoreCardProps) {
  return (
    <div
      className="group hover:bg-muted/50 transition-colors cursor-pointer border border-muted/50 rounded-md"
      onClick={onCreateCustom}
    >
      <div className="flex items-center justify-center py-3 px-4">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
            Add Custom Conversion
          </span>
        </div>
      </div>
    </div>
  );
}
