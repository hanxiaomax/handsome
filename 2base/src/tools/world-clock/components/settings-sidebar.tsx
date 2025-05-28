import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { TimePicker } from "./time-picker";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  displayFormat: "12h" | "24h";
  onFormatChange: (format: "12h" | "24h") => void;
  showSeconds: boolean;
  onToggleSeconds: (show: boolean) => void;
  baseTimezone: string;
  onBaseTimezoneChange: (timezone: string) => void;
  workingHours: { start: number; end: number };
  onWorkingHoursChange: (hours: { start: number; end: number }) => void;
  availableTimezones: Array<{ timezone: string; name: string }>;
  meetingMode: boolean;
  onMeetingModeChange: (enabled: boolean) => void;
  currentTime: Date;
  customTime: Date | null;
  onCustomTimeChange: (time: Date) => void;
  onResetTime: () => void;
}

export function SettingsSidebar({
  isOpen,
  onClose,
  displayFormat,
  onFormatChange,
  showSeconds,
  onToggleSeconds,
  baseTimezone,
  onBaseTimezoneChange,
  workingHours,
  onWorkingHoursChange,
  availableTimezones,
  meetingMode,
  onMeetingModeChange,
  currentTime,
  customTime,
  onCustomTimeChange,
  onResetTime,
}: SettingsSidebarProps) {
  if (!isOpen) return null;

  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, "0") + ":00";
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l shadow-lg z-50 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Display Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Time Format</Label>
              <Select value={displayFormat} onValueChange={onFormatChange}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-seconds"
                checked={showSeconds}
                onCheckedChange={onToggleSeconds}
              />
              <Label htmlFor="show-seconds" className="text-xs">
                Show seconds
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Base Timezone */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Reference Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs font-medium">Base Timezone</Label>
            <Select value={baseTimezone} onValueChange={onBaseTimezoneChange}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTimezones.map((tz) => (
                  <SelectItem key={tz.timezone} value={tz.timezone}>
                    {tz.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All relative times will be calculated from this timezone
            </p>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Working Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Start</Label>
                <Select
                  value={workingHours.start.toString()}
                  onValueChange={(value) =>
                    onWorkingHoursChange({
                      ...workingHours,
                      start: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {formatHour(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">End</Label>
                <Select
                  value={workingHours.end.toString()}
                  onValueChange={(value) =>
                    onWorkingHoursChange({
                      ...workingHours,
                      end: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {formatHour(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Define what hours are considered working hours for business
              indicators
            </p>
          </CardContent>
        </Card>

        {/* Meeting Assistant */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Meeting Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Enable Meeting Mode</Label>
              <Switch
                checked={meetingMode}
                onCheckedChange={onMeetingModeChange}
              />
            </div>

            {meetingMode && (
              <TimePicker
                currentTime={currentTime}
                customTime={customTime}
                onTimeChange={onCustomTimeChange}
                onReset={onResetTime}
              />
            )}

            <p className="text-xs text-muted-foreground">
              Meeting mode allows you to set a custom time and view the timeline
              to find optimal meeting times across timezones.
            </p>
          </CardContent>
        </Card>

        {/* Time Visualization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Time Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Working Hours</span>
                <span className="text-primary">●</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>After Hours</span>
                <span className="text-accent-foreground">●</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Night Time</span>
                <span className="text-destructive">●</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
