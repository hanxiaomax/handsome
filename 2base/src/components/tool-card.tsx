import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ToolInfo } from "@/types/tool";

interface ToolCardProps {
  tool: ToolInfo;
  onUse: (toolId: string) => void;
  onInfo: (toolId: string) => void;
}

export function ToolCard({ tool, onUse, onInfo }: ToolCardProps) {
  const IconComponent = tool.icon;

  return (
    <div className="group relative bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20">
      {/* Tool Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onInfo(tool.id)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View tool details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Tool Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
          {tool.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {tool.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
        {tool.tags.length > 3 && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
            +{tool.tags.length - 3}
          </span>
        )}
      </div>

      {/* Action Button */}
      <Button onClick={() => onUse(tool.id)} className="w-full" size="sm">
        Use Tool
      </Button>

      {/* Backend indicator */}
      {tool.requiresBackend && (
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Requires backend service</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
