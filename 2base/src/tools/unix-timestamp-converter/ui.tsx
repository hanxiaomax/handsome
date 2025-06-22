import { useState, useEffect, useRef, useCallback } from "react";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, ArrowLeftRight, Code } from "lucide-react";
import { toast } from "sonner";
import { toolInfo } from "./toolInfo";
import { UnixTimestampEngine } from "./lib";
import type { ConverterState, ConversionResult } from "./types";

const initialState: ConverterState = {
  currentTimestamp: Math.floor(Date.now() / 1000),
  inputValue: "",
  inputType: "timestamp",
  selectedFormat: "seconds",
  selectedDate: undefined,
  selectedTime: {
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    second: new Date().getSeconds(),
  },
  showCodeExamples: false,
  isProcessing: false,
  error: null,
};

export default function UnixTimestampConverter() {
  const [state, setState] = useState<ConverterState>(initialState);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const engine = useRef(new UnixTimestampEngine());

  // Update current timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      const current = engine.current.getCurrentTimestamp();
      setState((s) => ({ ...s, currentTimestamp: current.seconds }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Copy to clipboard handler
  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  // Convert timestamp
  const handleConvert = useCallback(() => {
    setState((s) => ({ ...s, isProcessing: true, error: null }));

    let conversionResult: ConversionResult | null = null;

    if (state.inputType === "datepicker") {
      // Convert from date picker
      if (state.selectedDate) {
        conversionResult = engine.current.convertDatePickerToTimestamp(
          state.selectedDate,
          state.selectedTime
        );
      }
    } else if (state.inputType === "timestamp") {
      conversionResult = engine.current.convertSingleTimestamp(
        state.inputValue,
        state.selectedFormat
      );
    } else {
      conversionResult = engine.current.convertDateToTimestamp(
        state.inputValue
      );
    }

    if (conversionResult) {
      setResult(conversionResult);
      setState((s) => ({ ...s, isProcessing: false }));
    } else {
      setState((s) => ({
        ...s,
        isProcessing: false,
        error: "Invalid input format",
      }));
      setResult(null);
      toast.error("Invalid input format");
    }
  }, [
    state.inputType,
    state.selectedDate,
    state.selectedTime,
    state.inputValue,
    state.selectedFormat,
  ]);

  // Auto-convert when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        (state.inputType === "datepicker" && state.selectedDate) ||
        (state.inputType !== "datepicker" && state.inputValue.trim())
      ) {
        handleConvert();
      } else {
        setResult(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    state.inputType,
    state.selectedDate,
    state.selectedTime,
    state.inputValue,
    state.selectedFormat,
    handleConvert,
  ]);

  // Swap input and output
  const handleSwap = useCallback(() => {
    if (result) {
      if (state.inputType === "timestamp") {
        // Convert timestamp result to date picker
        const dateTime = engine.current.convertTimestampToDatePicker(
          result.timestamp.seconds,
          "seconds"
        );
        if (dateTime) {
          setState((s) => ({
            ...s,
            selectedDate: dateTime.date,
            selectedTime: dateTime.time,
            inputType: "datepicker",
          }));
          toast.success("Swapped to date picker");
        }
      } else {
        // Convert date result to timestamp input
        setState((s) => ({
          ...s,
          inputValue: result.timestamp.seconds.toString(),
          inputType: "timestamp",
          selectedFormat: "seconds",
        }));
        toast.success("Swapped to timestamp input");
      }
    }
  }, [result, state.inputType]);

  // Update time
  const updateTime = useCallback(
    (field: "hour" | "minute" | "second", value: string) => {
      const numValue = Math.max(
        0,
        Math.min(parseInt(value) || 0, field === "hour" ? 23 : 59)
      );
      setState((s) => ({
        ...s,
        selectedTime: {
          ...s.selectedTime,
          [field]: numValue,
        },
      }));
    },
    []
  );

  const currentTimestamp = engine.current.getCurrentTimestamp();
  const currentDate = new Date();
  const codeExamples = result
    ? engine.current.getCodeExamples(result.timestamp.seconds)
    : [];

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ converterState: state }}>
      <div className="w-full p-6 space-y-8 mt-5">
        {/* Artistic Current Timestamp Display */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 border-2">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <CardContent className="relative p-8">
            <div className="text-center space-y-6">
              {/* Timestamp and Readable Time Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Timestamp (Left) */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      SECONDS
                    </p>
                    <div className="relative group">
                      <div className="text-5xl lg:text-6xl font-mono font-bold text-foreground tracking-tight">
                        {currentTimestamp.seconds.toLocaleString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          handleCopy(
                            currentTimestamp.seconds.toString(),
                            "Current timestamp"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Milliseconds and Microseconds */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        MILLISECONDS
                      </p>
                      <p className="text-lg font-mono font-semibold">
                        {currentTimestamp.milliseconds}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        MICROSECONDS
                      </p>
                      <p className="text-lg font-mono font-semibold">
                        {currentTimestamp.microseconds}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Readable Time (Right) */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      HUMAN READABLE
                    </p>
                    {/* Time (Upper) */}
                    <div className="relative group">
                      <div className="text-5xl lg:text-6xl font-mono font-bold text-primary tracking-tight">
                        {currentDate.toLocaleTimeString("en-US", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          handleCopy(
                            currentDate.toLocaleTimeString("en-US", {
                              hour12: false,
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }),
                            "Current time"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Date and Timezone */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </p>
                      <div className="relative group">
                        <p className="text-lg font-mono font-semibold text-foreground">
                          {currentDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleCopy(
                              currentDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }),
                              "Current date"
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Timestamp Converter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Timestamp Converter
              </div>
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Type Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={state.inputType === "timestamp" ? "default" : "ghost"}
                size="sm"
                onClick={() =>
                  setState((s) => ({ ...s, inputType: "timestamp" }))
                }
                className="data-[state=active]:bg-background"
              >
                Timestamp
              </Button>
              <Button
                variant={state.inputType === "datepicker" ? "default" : "ghost"}
                size="sm"
                onClick={() =>
                  setState((s) => ({ ...s, inputType: "datepicker" }))
                }
                className="data-[state=active]:bg-background"
              >
                Date Picker
              </Button>
              <Button
                variant={state.inputType === "datetime" ? "default" : "ghost"}
                size="sm"
                onClick={() =>
                  setState((s) => ({ ...s, inputType: "datetime" }))
                }
                className="data-[state=active]:bg-background"
              >
                Date String
              </Button>
            </div>

            {/* Input Section */}
            {state.inputType === "datepicker" ? (
              /* Date Picker Input */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Date</label>
                    <Input
                      type="date"
                      value={
                        state.selectedDate
                          ? state.selectedDate.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        setState((s) => ({
                          ...s,
                          selectedDate: dateValue
                            ? new Date(dateValue)
                            : undefined,
                        }));
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Time Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Time (HH:MM:SS)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={state.selectedTime.hour}
                        onChange={(e) => updateTime("hour", e.target.value)}
                        className="text-center"
                        placeholder="HH"
                      />
                      <span className="flex items-center text-muted-foreground">
                        :
                      </span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={state.selectedTime.minute}
                        onChange={(e) => updateTime("minute", e.target.value)}
                        className="text-center"
                        placeholder="MM"
                      />
                      <span className="flex items-center text-muted-foreground">
                        :
                      </span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={state.selectedTime.second}
                        onChange={(e) => updateTime("second", e.target.value)}
                        className="text-center"
                        placeholder="SS"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Timestamp/String Input */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input Type</label>
                    <Select
                      value={state.inputType}
                      onValueChange={(value) =>
                        setState((s) => ({
                          ...s,
                          inputType: value as "timestamp" | "datetime",
                        }))
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

                  {state.inputType === "timestamp" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <Select
                        value={state.selectedFormat}
                        onValueChange={(value) =>
                          setState((s) => ({
                            ...s,
                            selectedFormat: value as
                              | "seconds"
                              | "milliseconds"
                              | "microseconds",
                          }))
                        }
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
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {state.inputType === "timestamp"
                      ? "Unix Timestamp"
                      : "Date/Time String"}
                  </label>
                  <Input
                    value={state.inputValue}
                    onChange={(e) =>
                      setState((s) => ({ ...s, inputValue: e.target.value }))
                    }
                    placeholder={
                      state.inputType === "timestamp"
                        ? "1704067200"
                        : "2024-01-01 00:00:00 or 2024-01-01T00:00:00Z"
                    }
                    className="font-mono"
                  />
                  {state.error && (
                    <p className="text-sm text-destructive">{state.error}</p>
                  )}
                </div>
              </div>
            )}

            {/* Compact Results */}
            {result && (
              <div className="space-y-4 pt-4 border-t">
                {/* Timestamp Formats - Compact Grid */}
                <div>
                  <h5 className="text-sm font-medium mb-2">
                    Timestamp Formats
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries({
                      Seconds: result.timestamp.seconds,
                      Milliseconds: result.timestamp.milliseconds,
                      Microseconds: result.timestamp.microseconds,
                    }).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {label}
                          </p>
                          <p className="font-mono text-sm truncate">{value}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(value.toString(), label)}
                          className="ml-1 h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Standard Formats - Compact List */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Standard Formats</h5>
                  <div className="space-y-1">
                    {Object.entries({
                      "US Format": result.formatted.usFormat,
                      "ISO 8601": result.formatted.iso8601,
                      "ISO Extended": result.formatted.iso8601Extended,
                      "RFC 2822": result.formatted.rfc2822,
                      "RFC 2822 Alt": result.formatted.rfc2822Alternative,
                      "RFC 3339": result.formatted.rfc3339,
                      Local: result.formatted.locale,
                    }).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground mr-2">
                            {label}:
                          </span>
                          <span className="font-mono">{value}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(value, label)}
                          className="ml-1 h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relative Time & Timezones - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Relative Time */}
                  {result.relative.past && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">
                        Relative Time
                      </h5>
                      <Badge variant="secondary" className="text-sm">
                        {result.relative.past}
                      </Badge>
                    </div>
                  )}

                  {/* Key Timezones */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">Key Timezones</h5>
                    <div className="space-y-1">
                      {result.timezones.slice(0, 3).map((tz) => (
                        <div
                          key={tz.timezone.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {tz.timezone.abbreviation}:
                          </span>
                          <span className="font-mono">{tz.formatted}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Code Examples Toggle */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="text-sm font-medium">Code Examples</span>
                  </div>
                  <Switch
                    checked={state.showCodeExamples}
                    onCheckedChange={(checked) =>
                      setState((s) => ({ ...s, showCodeExamples: checked }))
                    }
                  />
                </div>

                {/* Code Examples */}
                {state.showCodeExamples && codeExamples.length > 0 && (
                  <div className="space-y-3">
                    {codeExamples.map((example) => (
                      <div key={example.language} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h6 className="text-sm font-medium">
                            {example.name}
                          </h6>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCopy(example.code, `${example.name} code`)
                            }
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolWrapper>
  );
}
