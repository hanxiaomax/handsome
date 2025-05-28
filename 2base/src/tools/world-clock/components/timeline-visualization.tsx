import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimeDisplay } from "../lib";

interface TimelineVisualizationProps {
  timeDisplays: TimeDisplay[];
  workingHours: { start: number; end: number };
  currentHour: number;
}

export function TimelineVisualization({
  timeDisplays,
  workingHours,
  currentHour,
}: TimelineVisualizationProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getHourStatus = (hour: number, timeDisplay: TimeDisplay) => {
    const timeInZone = new Date();
    timeInZone.setHours(hour, 0, 0, 0);

    const localTime = new Date(
      timeInZone.toLocaleString("en-US", {
        timeZone: timeDisplay.timezone.timezone,
      })
    );
    const localHour = localTime.getHours();
    const day = localTime.getDay();

    // Weekend check
    if (day === 0 || day === 6) return "weekend";

    // Working hours check
    if (localHour >= workingHours.start && localHour < workingHours.end) {
      return "working";
    }

    // Night time check (10 PM to 6 AM)
    if (localHour >= 22 || localHour < 6) {
      return "night";
    }

    return "after-hours";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-primary";
      case "after-hours":
        return "bg-accent";
      case "night":
        return "bg-destructive";
      case "weekend":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  if (timeDisplays.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">24-Hour Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Hour labels */}
          <div className="flex">
            <div className="w-24 text-xs text-muted-foreground">Time</div>
            <div className="flex-1 grid grid-cols-24 gap-px">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "text-xs text-center text-muted-foreground",
                    hour % 6 === 0 && "font-medium"
                  )}
                >
                  {hour % 6 === 0 ? hour.toString().padStart(2, "0") : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline for each timezone */}
          {timeDisplays.map((timeDisplay) => (
            <div key={timeDisplay.timezone.id} className="flex items-center">
              <div
                className="w-24 text-xs truncate"
                title={
                  timeDisplay.timezone.customLabel || timeDisplay.timezone.name
                }
              >
                {timeDisplay.timezone.customLabel || timeDisplay.timezone.name}
              </div>
              <div className="flex-1 grid grid-cols-24 gap-px">
                {hours.map((hour) => {
                  const status = getHourStatus(hour, timeDisplay);
                  const isCurrentHour = hour === currentHour;

                  return (
                    <div
                      key={hour}
                      className={cn(
                        "h-4 rounded-sm",
                        getStatusColor(status),
                        isCurrentHour && "ring-2 ring-foreground ring-offset-1"
                      )}
                      title={`${hour}:00 - ${status}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>Working</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-accent" />
              <span>After Hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-destructive" />
              <span>Night</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <span>Weekend</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
