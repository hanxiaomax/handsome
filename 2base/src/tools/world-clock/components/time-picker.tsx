import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, RotateCcw } from "lucide-react";

interface TimePickerProps {
  currentTime: Date;
  customTime: Date | null;
  onTimeChange: (time: Date) => void;
  onReset: () => void;
}

export function TimePicker({
  currentTime,
  customTime,
  onTimeChange,
  onReset,
}: TimePickerProps) {
  const displayTime = customTime || currentTime;

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (value: string) => {
    const newTime = new Date(value);
    if (!isNaN(newTime.getTime())) {
      onTimeChange(newTime);
    }
  };

  const handleQuickTime = (hours: number) => {
    const newTime = new Date();
    newTime.setHours(hours, 0, 0, 0);
    onTimeChange(newTime);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Meeting Time</Label>
        {customTime && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {/* Date and time input */}
        <Input
          type="datetime-local"
          value={formatDateForInput(displayTime)}
          onChange={(e) => handleDateTimeChange(e.target.value)}
          className="h-8"
        />

        {/* Quick time buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[9, 12, 15, 18].map((hour) => (
            <Button
              key={hour}
              variant="outline"
              size="sm"
              onClick={() => handleQuickTime(hour)}
              className="h-7 text-xs"
            >
              {hour}:00
            </Button>
          ))}
        </div>

        {/* Current time display */}
        <div className="text-xs text-muted-foreground">
          {customTime ? (
            <span>Custom: {displayTime.toLocaleString()}</span>
          ) : (
            <span>Current: {displayTime.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
