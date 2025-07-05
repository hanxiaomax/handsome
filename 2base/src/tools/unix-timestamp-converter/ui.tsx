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
import { Badge } from "@/components/ui/badge";
import { ToolLayout } from "@/components/layout/tool-layout";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Clock,
  Copy,
  ArrowLeftRight,
  CalendarIcon,
  Zap,
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
}: {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) => {
  const [time, setTime] = useState(
    date ? format(date, "HH:mm:ss") : "12:00:00"
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      selectedDate.setHours(hours, minutes, seconds, 0);
      onSelect(selectedDate);
    } else {
      onSelect(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const [hours, minutes, seconds] = newTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, seconds, 0);
      onSelect(newDate);
    }
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
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
    customFormat: "yyyy-MM-dd HH:mm:ss",
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
            Input type: {state.inputType}
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
      variant: "outline",
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

  // Auto-conversion with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.inputValue.trim()) {
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
              state.datetimeFormat === "custom"
                ? state.customFormat
                : undefined;
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
        } catch {
          setState((s) => ({ ...s, error: "Conversion failed" }));
        }
      } else {
        setResult(null);
        setState((s) => ({ ...s, error: null }));
      }
    }, 300);

    return () => clearTimeout(timer);
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

  const handleSwap = useCallback(() => {
    if (result) {
      setState((s) => ({
        ...s,
        inputValue: result.formatted.iso8601,
        inputType: "datetime",
        datetimeFormat: "freeform",
      }));
      toast.success("Input and output swapped");
    }
  }, [result]);

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
        return result.formatted.usFormat;
      case "locale":
        return result.formatted.locale;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Side - Input Controls with Current Time */}
          <div className="space-y-4 overflow-hidden">
            {/* Current Time Display - Top of Left Panel */}
            <Card
              id="current-time-section"
              className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Current Time
                      </p>
                      <p className="text-lg font-mono font-semibold text-primary">
                        {state.currentTimestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date().toLocaleString()}
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
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleQuickConvert}
                        className="h-8 w-8 p-0"
                      >
                        <Zap className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Controls */}
            <Card id="input-section" className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Input & Controls</CardTitle>
                  {result && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSwap}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Swap
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                            />
                          )}

                        {/* Text Input */}
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
                          className="font-mono"
                          disabled={
                            state.datetimeFormat !== "freeform" &&
                            state.datetimeFormat !== "custom" &&
                            !!selectedDate
                          }
                        />

                        {state.datetimeFormat !== "freeform" &&
                          state.datetimeFormat !== "custom" && (
                            <p className="text-xs text-muted-foreground">
                              Use the date picker above or edit the text
                              directly
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {state.error && (
                    <p className="text-sm text-destructive">{state.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Results Display with Independent Scrolling */}
          <div className="flex flex-col h-full min-h-0">
            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0 border-b">
                <CardTitle className="text-lg">
                  {result ? "Conversion Results" : "Enter a value to convert"}
                </CardTitle>
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-y-auto p-6">
                {result ? (
                  <div className="space-y-3">
                    {dateFormats.map((format) => {
                      const value = getFormatValue(format.id);
                      const hasValue = !!value;

                      return (
                        <div
                          key={format.id}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            hasValue
                              ? "border-primary/20 bg-primary/5"
                              : "border-muted bg-muted/20"
                          }`}
                        >
                          {/* Format Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {format.category}
                              </Badge>
                              <span className="font-medium text-sm">
                                {format.name}
                              </span>
                            </div>
                            {hasValue && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(value, format.name)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          {/* Format Description */}
                          <p className="text-xs text-muted-foreground mb-2">
                            {format.description}
                          </p>

                          {/* Format Value */}
                          <div>
                            {hasValue ? (
                              <code className="text-sm font-mono break-all bg-background px-2 py-1 rounded border block">
                                {value}
                              </code>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">
                                No conversion yet
                              </span>
                            )}
                          </div>
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
