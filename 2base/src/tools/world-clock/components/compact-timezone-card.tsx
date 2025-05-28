import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeDisplay } from "../lib";

interface CompactTimeZoneCardProps {
  timeDisplay: TimeDisplay;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}

export function CompactTimeZoneCard({
  timeDisplay,
  onRemove,
  onToggleFavorite,
  onUpdateLabel,
}: CompactTimeZoneCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(
    timeDisplay.timezone.customLabel || timeDisplay.timezone.name
  );

  const handleSaveLabel = () => {
    onUpdateLabel(timeDisplay.timezone.id, editLabel);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditLabel(timeDisplay.timezone.customLabel || timeDisplay.timezone.name);
    setIsEditing(false);
  };

  const getDayPeriodIcon = (period: string): string => {
    switch (period) {
      case "dawn":
        return "◐";
      case "morning":
        return "○";
      case "afternoon":
        return "●";
      case "evening":
        return "◑";
      case "night":
        return "◯";
      default:
        return "○";
    }
  };

  const getDayPeriodBackground = (period: string): string => {
    switch (period) {
      case "dawn":
        return "bg-accent/20 border-accent/30";
      case "morning":
        return "bg-primary/10 border-primary/20";
      case "afternoon":
        return "bg-secondary/30 border-secondary/40";
      case "evening":
        return "bg-accent/30 border-accent/40";
      case "night":
        return "bg-muted border-muted-foreground/20";
      default:
        return "bg-card border-border";
    }
  };

  const getBusinessHoursBorder = (): string => {
    if (timeDisplay.isBusinessHours) {
      return "border-l-4 border-l-primary";
    } else if (timeDisplay.dayPeriod === "night") {
      return "border-l-4 border-l-destructive";
    } else {
      return "border-l-4 border-l-accent";
    }
  };

  const displayName =
    timeDisplay.timezone.customLabel || timeDisplay.timezone.name;

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md h-full",
        getDayPeriodBackground(timeDisplay.dayPeriod),
        getBusinessHoursBorder()
      )}
    >
      <CardContent className="p-3">
        {/* Header with location and controls */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="text-sm">
              {getDayPeriodIcon(timeDisplay.dayPeriod)}
            </span>

            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="h-5 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveLabel();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveLabel}
                  className="h-5 w-5 p-0"
                >
                  <Check className="h-2 w-2" />
                </Button>
              </div>
            ) : (
              <h3
                className="font-medium text-xs truncate cursor-pointer hover:text-primary"
                onClick={() => setIsEditing(true)}
                title={displayName}
              >
                {displayName}
              </h3>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFavorite(timeDisplay.timezone.id)}
              className="h-4 w-4 p-0"
            >
              <Star
                className={cn(
                  "h-2 w-2",
                  timeDisplay.timezone.isFavorite && "fill-primary text-primary"
                )}
              />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(timeDisplay.timezone.id)}
              className="h-4 w-4 p-0 text-destructive hover:text-destructive/80"
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        </div>

        {/* Time display */}
        <div className="text-center mb-2">
          <div className="text-lg font-mono font-bold leading-tight">
            {timeDisplay.formattedTime}
          </div>
          <div className="text-xs text-muted-foreground">
            {timeDisplay.formattedDate}
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-2 text-xs">
          {timeDisplay.isBusinessHours ? (
            <span className="text-primary" title="Business Hours">
              ●
            </span>
          ) : timeDisplay.dayPeriod === "night" ? (
            <span className="text-destructive" title="Night Time">
              ◯
            </span>
          ) : (
            <span className="text-accent-foreground" title="After Hours">
              ◐
            </span>
          )}

          {timeDisplay.isWeekend && (
            <span className="text-muted-foreground" title="Weekend">
              ▢
            </span>
          )}
        </div>

        {/* UTC offset */}
        <div className="text-center mt-1">
          <span className="text-xs text-muted-foreground">
            {timeDisplay.utcOffset}
            {timeDisplay.isDST && " (DST)"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
