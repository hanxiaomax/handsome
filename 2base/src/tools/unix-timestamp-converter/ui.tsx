"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ToolLayout } from "@/components/layout/tool-layout";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Copy,
  Zap,
  CalendarIcon,
  CornerRightDown,
  ArrowLeftRight,
  Info,
  Download,
  FileX,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToolControls } from "@/hooks/use-tool-controls";
import { toolInfo } from "./toolInfo";
import {
  UnixTimestampEngine,
  DATETIME_FORMATS,
  parseDateTime,
  formatDateTime,
} from "./lib/engine";
import type { ConverterState, ConversionResult } from "./types";
import type { CustomToolButton } from "@/components/layout/tool-layout";

// Custom DateTimePicker component
const DateTimePicker = ({
  date,
  onSelect,
  onDateTimeChange,
}: {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onDateTimeChange?: (dateTimeString: string) => void;
}) => {
  const [time, setTime] = useState(
    date ? format(date, "HH:mm:ss") : "12:00:00"
  );

  // Update time when date changes from outside
  useEffect(() => {
    if (date) {
      const newTime = format(date, "HH:mm:ss");
      setTime(newTime);
    }
  }, [date]);

  const updateDateTime = useCallback(
    (newDate: Date) => {
      onSelect(newDate);
      // Also update the input value immediately
      if (onDateTimeChange) {
        onDateTimeChange(format(newDate, "yyyy-MM-dd HH:mm:ss"));
      }
    },
    [onSelect, onDateTimeChange]
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      selectedDate.setHours(hours, minutes, seconds, 0);
      updateDateTime(selectedDate);
    } else {
      onSelect(undefined);
      if (onDateTimeChange) {
        onDateTimeChange("");
      }
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const [hours, minutes, seconds] = newTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, seconds, 0);
      updateDateTime(newDate);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          step="1"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="w-32"
        />
      </div>
      {date && (
        <div className="text-xs text-muted-foreground">
          Selected: {format(date, "yyyy-MM-dd HH:mm:ss")}
        </div>
      )}
    </div>
  );
};

export default function UnixTimestampConverter() {
  // Standard tool controls (no state preservation needed)
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    // No state parameter - we don't want to save state on minimize
  });

  // Tool state
  const [state, setState] = useState<ConverterState>({
    currentTimestamp: Math.floor(Date.now() / 1000),
    inputValue: "",
    inputType: "timestamp",
    selectedFormat: "seconds",
    datetimeFormat: "freeform",
    customFormat: "YYYY-MM-DD HH:mm:ss",
    selectedTimezone: "UTC",
    isProcessing: false,
    error: null,
  });

  // Settings panel state
  const [showSettings, setShowSettings] = useState(false);

  // Additional component states (moved before handleMinimize)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [result, setResult] = useState<ConversionResult | null>(null);

  // Custom documentation handler
  const handleShowDocumentation = useCallback(() => {
    toast.info("Documentation", {
      description: "Opening Unix Timestamp Converter documentation...",
    });
    // Could open a modal or navigate to docs
  }, []);

  // Settings panel content
  const settingsContent = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Display Options
        </h3>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Current timestamp: {state.currentTimestamp}
          </div>

          <div className="text-xs text-muted-foreground">
            Selected format: {state.selectedFormat}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Custom Format
        </h3>
        <div className="space-y-2">
          <Input
            value={state.customFormat}
            onChange={(e) =>
              setState((s) => ({ ...s, customFormat: e.target.value }))
            }
            placeholder="yyyy-MM-dd HH:mm:ss"
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            date-fns format string
          </div>
        </div>
      </div>
    </div>
  );

  // Custom tool buttons
  const customButtons: CustomToolButton[] = [
    {
      id: "export-data",
      icon: Download,
      title: "Export Results",
      onClick: () => {
        if (result) {
          const exportData = {
            timestamp: state.currentTimestamp,
            inputValue: state.inputValue,
            inputType: state.inputType,
            results: result,
            exportedAt: new Date().toISOString(),
          };
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `timestamp-conversion-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Export successful", {
            description: "Conversion results exported to JSON file",
          });
        }
      },
      disabled: !result,
    },
    {
      id: "clear-all",
      icon: FileX,
      title: "Clear All",
      onClick: () => {
        setState({
          currentTimestamp: Math.floor(Date.now() / 1000),
          inputValue: "",
          inputType: "timestamp",
          selectedFormat: "seconds",
          datetimeFormat: "freeform",
          customFormat: "yyyy-MM-dd HH:mm:ss",
          selectedTimezone: "UTC",
          isProcessing: false,
          error: null,
        });
        setSelectedDate(undefined);
        setResult(null);
        toast.success("Cleared", {
          description: "All input and results cleared",
        });
      },
      disabled: !state.inputValue,
    },
    {
      id: "reset-to-current",
      icon: RotateCcw,
      title: "Reset to Current",
      onClick: () => {
        const now = Math.floor(Date.now() / 1000);
        setState((prevState) => ({
          ...prevState,
          currentTimestamp: now,
          inputValue: now.toString(),
          inputType: "timestamp",
          selectedFormat: "seconds",
        }));
        toast.success("Reset", {
          description: "Reset to current timestamp",
        });
      },
    },
  ];

  const engine = new UnixTimestampEngine();
  const dateFormats = engine.getDateFormats();

  // Real-time current timestamp update
  useEffect(() => {
    const interval = setInterval(() => {
      setState((s) => ({
        ...s,
        currentTimestamp: Math.floor(Date.now() / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Manual conversion function
  const handleConvert = useCallback(() => {
    if (!state.inputValue.trim()) {
      setState((s) => ({ ...s, error: "Please enter a value to convert" }));
      return;
    }

    try {
      let timestamp: number;

      if (state.inputType === "timestamp") {
        const value = parseFloat(state.inputValue);
        if (isNaN(value)) {
          setState((s) => ({ ...s, error: "Invalid timestamp format" }));
          return;
        }

        switch (state.selectedFormat) {
          case "seconds":
            timestamp = value;
            break;
          case "milliseconds":
            timestamp = value / 1000;
            break;
          case "microseconds":
            timestamp = value / 1000000;
            break;
          default:
            timestamp = value;
        }
      } else {
        // Parse datetime string
        const customFormat =
          state.datetimeFormat === "custom" ? state.customFormat : undefined;
        const date = parseDateTime(
          state.inputValue,
          state.datetimeFormat,
          customFormat
        );

        if (!date) {
          setState((s) => ({ ...s, error: "Invalid datetime format" }));
          return;
        }

        timestamp = Math.floor(date.getTime() / 1000);
      }

      const conversionResult = engine.convertSingleTimestamp(
        timestamp.toString(),
        state.selectedFormat
      );
      setResult(conversionResult);
      setState((s) => ({ ...s, error: null }));
      toast.success("Conversion completed successfully");
    } catch {
      setState((s) => ({ ...s, error: "Conversion failed" }));
    }
  }, [
    state.inputValue,
    state.inputType,
    state.selectedFormat,
    state.datetimeFormat,
    state.customFormat,
  ]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  const handleQuickConvert = useCallback(() => {
    setState((s) => ({
      ...s,
      inputValue: s.currentTimestamp.toString(),
      inputType: "timestamp",
      selectedFormat: "seconds",
    }));
    toast.success("Current timestamp set as input");
  }, []);

  const handleSwap = useCallback((value: string, formatName: string) => {
    // Determine input type based on format
    let newInputType: "timestamp" | "datetime" = "datetime";
    let newFormat: "seconds" | "milliseconds" | "microseconds" = "seconds";
    let newDatetimeFormat: keyof typeof DATETIME_FORMATS = "freeform";

    // Check if it's a timestamp format
    if (
      formatName.includes("Seconds") ||
      formatName === "Unix Timestamp (Seconds)"
    ) {
      newInputType = "timestamp";
      newFormat = "seconds";
    } else if (
      formatName.includes("Milliseconds") ||
      formatName === "Unix Timestamp (Milliseconds)"
    ) {
      newInputType = "timestamp";
      newFormat = "milliseconds";
    } else if (
      formatName.includes("Microseconds") ||
      formatName === "Unix Timestamp (Microseconds)"
    ) {
      newInputType = "timestamp";
      newFormat = "microseconds";
    } else {
      // It's a datetime format
      newInputType = "datetime";

      // Determine the appropriate datetime format
      if (formatName === "ISO 8601") {
        newDatetimeFormat = "iso8601";
      } else if (formatName === "RFC 2822") {
        newDatetimeFormat = "rfc2822";
      } else if (formatName === "US Format") {
        newDatetimeFormat = "us";
      } else if (formatName === "Local Format") {
        newDatetimeFormat = "locale";
      } else {
        newDatetimeFormat = "freeform";
      }
    }

    setState((s) => ({
      ...s,
      inputValue: value,
      inputType: newInputType,
      selectedFormat: newFormat,
      datetimeFormat: newDatetimeFormat,
    }));

    // Clear current result and date selection
    setResult(null);
    setSelectedDate(undefined);

    toast.success(`${formatName} set as input`, {
      description: "Ready to convert to other formats",
    });
  }, []);

  const handleDatetimeFormatChange = useCallback(
    (newFormat: keyof typeof DATETIME_FORMATS) => {
      setState((s) => ({ ...s, datetimeFormat: newFormat }));

      if (selectedDate && newFormat !== "freeform") {
        const customFormat =
          newFormat === "custom" ? state.customFormat : undefined;
        const formatted = formatDateTime(selectedDate, newFormat, customFormat);
        setState((s) => ({ ...s, inputValue: formatted }));
      }
    },
    [selectedDate, state.customFormat]
  );

  const currentFormatConfig = DATETIME_FORMATS[state.datetimeFormat];

  const getFormatValue = (formatId: string) => {
    if (!result) return "";

    // Helper function to get IANA timezone ID from our simplified timezone ID
    const getIanaTimezone = (timezoneId: string): string => {
      // We need to map simplified timezone IDs to IANA timezone IDs
      const timezoneMapping: Record<string, string> = {
        UTC: "UTC",
        EST: "America/New_York",
        PST: "America/Los_Angeles",
        GMT: "Europe/London",
        JST: "Asia/Tokyo",
        CET: "Europe/Paris",
        IST: "Asia/Kolkata",
        CST: "Asia/Shanghai",
      };
      return timezoneMapping[timezoneId] || "UTC";
    };

    switch (formatId) {
      case "seconds":
        return result.timestamp.seconds.toString();
      case "milliseconds":
        return result.timestamp.milliseconds.toString();
      case "microseconds":
        return result.timestamp.microseconds.toString();
      case "iso8601":
        return result.formatted.iso8601;
      case "iso8601Extended":
        return result.formatted.iso8601Extended;
      case "usFormat":
        // Re-format with selected timezone using correct IANA timezone ID
        return new Date(result.timestamp.seconds * 1000).toLocaleString(
          "en-US",
          {
            timeZone: getIanaTimezone(state.selectedTimezone),
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }
        );
      case "locale":
        // Re-format with selected timezone using correct IANA timezone ID
        return new Date(result.timestamp.seconds * 1000).toLocaleString(
          undefined,
          {
            timeZone: getIanaTimezone(state.selectedTimezone),
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        );
      case "rfc2822":
        return result.formatted.rfc2822;
      case "rfc3339":
        return result.formatted.rfc3339;
      default:
        return "";
    }
  };

  return (
    <ToolLayout
      {...toolLayoutProps}
      customButtons={customButtons}
      onShowDocumentation={handleShowDocumentation}
      rightSidebarContent={showSettings ? settingsContent : undefined}
      rightSidebarTitle="Converter Settings"
      rightSidebarDescription="Configure timestamp conversion options"
      isRightSidebarOpen={showSettings}
      onRightSidebarToggle={() => setShowSettings(!showSettings)}
    >
      {/* Tool Main Container - Fixed Height Layout */}
      <div
        id="tool-main-container"
        className="w-full max-w-7xl mx-auto p-4 h-[calc(100vh-120px)]"
      >
        {/* Main Content - Left-Right Layout with Fixed Heights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Side - Input Controls (1 column) */}
          <div className="lg:col-span-1 space-y-4 overflow-hidden">
            {/* Input Controls */}
            <Card id="input-section" className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Input & Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Time Display - Top of Controls */}
                <div
                  id="current-time-section"
                  className="p-3 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Current Time
                        </p>
                        <p className="text-sm font-mono font-semibold text-primary">
                          {new Date(
                            state.currentTimestamp * 1000
                          ).toLocaleString(undefined, {
                            hour12: false,
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {new Date().toLocaleString(undefined, {
                            hour12: false,
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCopy(
                              state.currentTimestamp.toString(),
                              "Current timestamp"
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleQuickConvert}
                          className="h-6 w-6 p-0"
                        >
                          <CornerRightDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Type Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Input Type</Label>
                    <Select
                      value={state.inputType}
                      onValueChange={(value: "timestamp" | "datetime") =>
                        setState((s) => ({ ...s, inputType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="timestamp">
                          Unix Timestamp
                        </SelectItem>
                        <SelectItem value="datetime">
                          Date/Time String
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format Selection */}
                  {state.inputType === "timestamp" ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Timestamp Format
                      </Label>
                      <Select
                        value={state.selectedFormat}
                        onValueChange={(
                          value: "seconds" | "milliseconds" | "microseconds"
                        ) => setState((s) => ({ ...s, selectedFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="milliseconds">
                            Milliseconds
                          </SelectItem>
                          <SelectItem value="microseconds">
                            Microseconds
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        DateTime Format
                      </Label>
                      <Select
                        value={state.datetimeFormat}
                        onValueChange={handleDatetimeFormatChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(DATETIME_FORMATS).map(
                            ([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Custom Format Input */}
                {state.inputType === "datetime" &&
                  state.datetimeFormat === "custom" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Custom Format String
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input
                        value={state.customFormat}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            customFormat: e.target.value,
                          }))
                        }
                        placeholder="yyyy-MM-dd HH:mm:ss"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use date-fns format tokens (e.g., yyyy=year, MM=month,
                        dd=day, HH=hour, mm=minute, ss=second)
                      </p>
                    </div>
                  )}

                {/* Input Controls */}
                <div className="space-y-4">
                  {state.inputType === "timestamp" ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Timestamp Value
                      </Label>
                      <Input
                        value={state.inputValue}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            inputValue: e.target.value,
                          }))
                        }
                        placeholder="1704067200"
                        className="font-mono"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Date/Time Input
                          <span className="text-xs text-muted-foreground ml-2">
                            ({currentFormatConfig.description})
                          </span>
                        </Label>

                        {/* Date Picker (for structured formats) */}
                        {state.datetimeFormat !== "freeform" &&
                          state.datetimeFormat !== "custom" && (
                            <DateTimePicker
                              date={selectedDate}
                              onSelect={setSelectedDate}
                              onDateTimeChange={(dateTimeString) =>
                                setState((s) => ({
                                  ...s,
                                  inputValue: dateTimeString,
                                }))
                              }
                            />
                          )}

                        {/* Text Input */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">
                            Input Value
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={state.inputValue}
                              onChange={(e) =>
                                setState((s) => ({
                                  ...s,
                                  inputValue: e.target.value,
                                }))
                              }
                              placeholder={
                                state.datetimeFormat === "custom"
                                  ? state.customFormat
                                  : currentFormatConfig.placeholder
                              }
                              className="font-mono flex-1"
                            />
                            {state.inputValue && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    state.inputValue
                                  );
                                  toast.success("Copied!", {
                                    description:
                                      "DateTime string copied to clipboard",
                                  });
                                }}
                                className="h-8 w-8 p-0 flex-shrink-0"
                                title="Copy DateTime String"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {state.datetimeFormat !== "freeform" &&
                            state.datetimeFormat !== "custom" && (
                              <p className="text-xs text-muted-foreground">
                                Use the date picker above or edit the text
                                directly
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                  {state.error && (
                    <p className="text-sm text-destructive">{state.error}</p>
                  )}

                  {/* Convert Button */}
                  <Button
                    onClick={handleConvert}
                    disabled={!state.inputValue.trim()}
                    className="w-full flex items-center justify-center gap-2"
                    size="lg"
                  >
                    <Zap className="h-4 w-4" />
                    Convert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Results Display with Independent Scrolling (2 columns) */}
          <Card className="lg:col-span-2 flex flex-col h-full min-h-0">
            <CardHeader className="pb-3 flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {result ? "Conversion Results" : "Enter a value to convert"}
                </CardTitle>
              </div>

              {/* Timezone Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Display Timezone</Label>
                <Select
                  value={state.selectedTimezone}
                  onValueChange={(value: string) =>
                    setState((s) => ({ ...s, selectedTimezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {engine.getTimezones().map((timezone) => (
                      <SelectItem key={timezone.id} value={timezone.id}>
                        {timezone.name} ({timezone.offset})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto pr-2">
              {result ? (
                <div className="space-y-2">
                  {dateFormats.map((format) => {
                    const value = getFormatValue(format.id);
                    const hasValue = !!value;

                    return (
                      <div
                        key={format.id}
                        className="flex items-center justify-between py-2 px-3 rounded border hover:bg-muted/20 transition-colors"
                      >
                        {/* Left: Format name and value */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-muted-foreground">
                              {format.name}
                            </span>
                            {/* Show timezone indicator for time-related formats */}
                            {(format.id === "locale" ||
                              format.id === "usFormat") && (
                              <span className="text-xs text-primary">
                                ({state.selectedTimezone})
                              </span>
                            )}
                          </div>
                          {hasValue ? (
                            <code className="text-sm font-mono break-all text-foreground block">
                              {value}
                            </code>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              No conversion yet
                            </span>
                          )}
                        </div>

                        {/* Right: Action buttons */}
                        {hasValue && (
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            {/* Info Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  title="Format Info"
                                >
                                  <Info className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-lg">
                                    {format.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div>
                                    <h4 className="font-medium text-sm mb-1 text-muted-foreground">
                                      Category
                                    </h4>
                                    <p className="text-sm">{format.category}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm mb-1 text-muted-foreground">
                                      Description
                                    </h4>
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {format.description}
                                    </p>
                                  </div>
                                  {hasValue && (
                                    <div className="pt-2 border-t">
                                      <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                                        Current Value
                                      </h4>
                                      <code className="text-sm font-mono break-all px-3 py-2 border rounded bg-muted/20 block">
                                        {value}
                                      </code>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Swap Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSwap(value, format.name)}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                              title={`Use ${format.name} as input`}
                            >
                              <ArrowLeftRight className="h-3 w-3" />
                            </Button>

                            {/* Copy Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(value, format.name)}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                              title={`Copy ${format.name}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-muted-foreground space-y-2 text-center">
                    <Clock className="h-12 w-12 mx-auto opacity-50" />
                    <p className="text-lg font-medium">Ready to convert</p>
                    <p className="text-sm">
                      Input a Unix timestamp or date/time string to see
                      conversion results
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}
