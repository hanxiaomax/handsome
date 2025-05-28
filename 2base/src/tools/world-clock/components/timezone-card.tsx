import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, X, Edit2, Check, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeDisplay } from "../lib";

interface TimeZoneCardProps {
  timeDisplay: TimeDisplay;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  isDragging?: boolean;
}

export function TimeZoneCard({
  timeDisplay,
  onRemove,
  onToggleFavorite,
  onUpdateLabel,
  isDragging = false,
}: TimeZoneCardProps) {
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
        return "🌅";
      case "morning":
        return "🌞";
      case "afternoon":
        return "☀️";
      case "evening":
        return "🌆";
      case "night":
        return "🌙";
      default:
        return "🕐";
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
        return "bg-muted border-muted-foreground/20 text-muted-foreground";
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
        "transition-all duration-200 hover:shadow-md",
        getDayPeriodBackground(timeDisplay.dayPeriod),
        getBusinessHoursBorder(),
        isDragging && "opacity-50 rotate-2"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Drag handle */}
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="h-4 w-4 cursor-grab opacity-50 hover:opacity-100 text-muted-foreground" />

            <div className="flex-1">
              {/* Location and label */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {getDayPeriodIcon(timeDisplay.dayPeriod)}
                </span>

                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="h-6 text-sm"
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
                      className="h-6 w-6 p-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-medium text-sm">{displayName}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* City and country */}
              <p className="text-xs text-muted-foreground mb-2">
                {timeDisplay.timezone.city}, {timeDisplay.timezone.country}
              </p>

              {/* Time display */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-mono font-bold">
                  {timeDisplay.formattedTime}
                </span>
                <span className="text-sm text-muted-foreground">
                  {timeDisplay.formattedDate}
                </span>
              </div>

              {/* UTC offset and relative time */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <span>
                    {timeDisplay.utcOffset}
                    {timeDisplay.isDST && " (DST)"}
                  </span>
                  <span>•</span>
                  <span>{timeDisplay.relativeTime}</span>
                </div>

                {/* Business hours indicator */}
                <div className="flex items-center gap-1">
                  {timeDisplay.isBusinessHours ? (
                    <>
                      <span className="text-primary">✅</span>
                      <span>Business Hours</span>
                    </>
                  ) : timeDisplay.dayPeriod === "night" ? (
                    <>
                      <span className="text-destructive">❌</span>
                      <span>Night Time</span>
                    </>
                  ) : (
                    <>
                      <span className="text-accent-foreground">⚠️</span>
                      <span>After Hours</span>
                    </>
                  )}

                  {timeDisplay.isWeekend && (
                    <>
                      <span>•</span>
                      <span>Weekend</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFavorite(timeDisplay.timezone.id)}
              className="h-6 w-6 p-0"
            >
              <Star
                className={cn(
                  "h-3 w-3",
                  timeDisplay.timezone.isFavorite && "fill-primary text-primary"
                )}
              />
            </Button>

            {!timeDisplay.timezone.isLocal && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(timeDisplay.timezone.id)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
