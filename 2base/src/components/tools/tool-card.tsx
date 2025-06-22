import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ToolInfo } from "@/types/tool";
import { getToolVersionInfo } from "@/lib/tool-utils";

interface ToolCardProps {
  tool: ToolInfo;
  onUse: (toolId: string) => void;
  onInfo: (toolId: string) => void;
}

export function ToolCard({ tool, onUse, onInfo }: ToolCardProps) {
  const IconComponent = tool.icon;
  const versionInfo = getToolVersionInfo(tool);

  return (
    <div className="group relative bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20">
      {/* NEW Badge - Top Right Corner */}
      {versionInfo.isNew && (
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="text-xs bg-secondary text-secondary-foreground border-secondary font-medium"
          >
            NEW
          </Badge>
        </div>
      )}

      {/* Tool Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          {IconComponent && typeof IconComponent === "function" ? (
            <IconComponent className="h-6 w-6 text-primary" />
          ) : (
            <div className="h-6 w-6 bg-muted rounded" />
          )}
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
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1 flex-1">
            {tool.name}
          </h3>
          <Badge
            variant={versionInfo.isPaid ? "destructive" : "secondary"}
            className="text-xs"
          >
            {versionInfo.pricing}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-2">
          {tool.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{versionInfo.version}</span>
          <span>•</span>
          <span>{versionInfo.releaseDate}</span>
        </div>
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
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
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
