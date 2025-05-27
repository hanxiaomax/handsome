import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import type { ToolInfo } from "@/types/tool";
import { getToolVersionInfo } from "@/lib/tool-utils";

interface ToolInfoCardProps {
  tool: ToolInfo;
  onSelect?: (toolId: string) => void;
  onUseTool?: (toolId: string) => void;
  showFavoriteButton?: boolean;
  compact?: boolean;
}

export function ToolInfoCard({
  tool,
  onSelect,
  onUseTool,
  showFavoriteButton = true,
  compact = false,
}: ToolInfoCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const versionInfo = getToolVersionInfo(tool);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(tool.id);
    }
  };

  const handleUseTool = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUseTool) {
      onUseTool(tool.id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(tool.id);
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-200 ${
        onSelect ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className={compact ? "pb-2 p-3" : "pb-3 p-4"}>
        <div className="flex items-start justify-between">
          <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
            <div
              className={`${
                compact ? "p-1.5" : "p-2"
              } rounded-lg bg-primary/10`}
            >
              <tool.icon
                className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-primary`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle
                className={`${compact ? "text-base" : "text-lg"} truncate`}
              >
                {tool.name}
              </CardTitle>
              <div
                className={`flex items-center ${
                  compact ? "gap-1 mt-0.5" : "gap-2 mt-1"
                }`}
              >
                <span
                  className={`${
                    compact ? "text-[10px]" : "text-xs"
                  } text-muted-foreground`}
                >
                  v{versionInfo.version}
                </span>
                {versionInfo.isNew && (
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1 py-0 ${
                      compact ? "h-3" : "h-4"
                    }`}
                  >
                    NEW
                  </Badge>
                )}
                <Badge
                  variant={versionInfo.isPaid ? "destructive" : "secondary"}
                  className={`text-[10px] px-1 py-0 ${compact ? "h-3" : "h-4"}`}
                >
                  {versionInfo.pricing}
                </Badge>
              </div>
            </div>
          </div>
          {showFavoriteButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={compact ? "h-6 w-6 p-0" : "h-8 w-8 p-0"}
            >
              <Heart
                className={`${compact ? "h-3 w-3" : "h-4 w-4"} ${
                  isFavorite(tool.id) ? "fill-current text-destructive" : ""
                }`}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? "pt-0 p-3" : "pt-0 p-4"}>
        <p
          className={`${
            compact ? "text-xs mb-3" : "text-sm mb-4"
          } text-muted-foreground line-clamp-2`}
        >
          {tool.description}
        </p>

        <div className={`flex flex-wrap gap-1 ${compact ? "mb-3" : "mb-4"}`}>
          {tool.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={compact ? "text-[10px]" : "text-xs"}
            >
              {tag}
            </Badge>
          ))}
          {tool.tags.length > (compact ? 2 : 3) && (
            <Badge
              variant="outline"
              className={compact ? "text-[10px]" : "text-xs"}
            >
              +{tool.tags.length - (compact ? 2 : 3)}
            </Badge>
          )}
        </div>

        {onUseTool && (
          <Button
            className={`w-full ${compact ? "h-7" : ""}`}
            size="sm"
            onClick={handleUseTool}
          >
            <ExternalLink
              className={`${compact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`}
            />
            Use Tool
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
