import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToolLayout } from "@/components/layout/tool-layout";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Copy, RefreshCw, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMinimizedTools } from "@/contexts/minimized-tools-context";
import { toolInfo } from "./toolInfo";
import { UnixTimestampEngine } from "./lib";
import type { ConverterState, ConversionResult } from "./lib/types";

const initialState: ConverterState = {
  currentTimestamp: Math.floor(Date.now() / 1000),
  inputValue: "",
  inputType: "timestamp",
  selectedFormat: "seconds",
  selectedTimezone: "UTC",
  outputFormat: "iso8601",
  showTimezones: true,
  showRelative: true,
  batchInput: "",
  batchResults: [],
  history: [],
  isProcessing: false,
  error: null,
};

export default function UnixTimestampConverter() {
  const navigate = useNavigate();
  const { minimizeTool } = useMinimizedTools();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [state, setState] = useState<ConverterState>(initialState);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const engine = useRef(new UnixTimestampEngine());

  // Window control handlers
  const handleClose = useCallback(() => navigate("/"), [navigate]);
  const handleMinimize = useCallback(() => {
    minimizeTool(toolInfo);
    navigate("/");
  }, [minimizeTool, navigate]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

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
    if (!state.inputValue.trim()) {
      setResult(null);
      return;
    }

    setState((s) => ({ ...s, isProcessing: true, error: null }));

    let conversionResult: ConversionResult | null = null;

    if (state.inputType === "timestamp") {
      conversionResult = engine.current.convertSingleTimestamp(
        state.inputValue,
        state.selectedFormat
      );
    } else {
      conversionResult = engine.current.convertDateToTimestamp(
        state.inputValue,
        state.selectedTimezone
      );
    }

    if (conversionResult) {
      setResult(conversionResult);
      setState((s) => ({
        ...s,
        isProcessing: false,
        history: [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            input: state.inputValue,
            inputType: state.inputType,
            result: conversionResult!,
          },
          ...s.history.slice(0, 49), // Keep only 50 items
        ],
      }));
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
    state.inputValue,
    state.inputType,
    state.selectedFormat,
    state.selectedTimezone,
  ]);

  // Auto-convert when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.inputValue.trim()) {
        handleConvert();
      } else {
        setResult(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    state.inputValue,
    state.inputType,
    state.selectedFormat,
    state.selectedTimezone,
    handleConvert,
  ]);

  // Batch conversion
  const handleBatchConvert = useCallback(() => {
    if (!state.batchInput.trim()) {
      setState((s) => ({ ...s, batchResults: [] }));
      return;
    }

    setState((s) => ({ ...s, isProcessing: true }));

    const timestamps = engine.current.parseBatchInput(state.batchInput);
    const results = engine.current.processBatchConversion(
      timestamps,
      state.selectedFormat
    );

    setState((s) => ({ ...s, batchResults: results, isProcessing: false }));
    toast.success(`Converted ${results.length} timestamps`);
  }, [state.batchInput, state.selectedFormat]);

  // Export batch results
  const handleExportCSV = useCallback(() => {
    if (state.batchResults.length === 0) {
      toast.error("No results to export");
      return;
    }

    engine.current.downloadCSV(state.batchResults);
    toast.success("Results exported to CSV");
  }, [state.batchResults]);

  const currentTimestamp = engine.current.getCurrentTimestamp();

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onClose={handleClose}
      onMinimize={handleMinimize}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Current Timestamp Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Unix Timestamp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Seconds</p>
                  <p className="font-mono text-lg">
                    {currentTimestamp.seconds}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      currentTimestamp.seconds.toString(),
                      "Timestamp (seconds)"
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Milliseconds</p>
                  <p className="font-mono text-lg">
                    {currentTimestamp.milliseconds}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      currentTimestamp.milliseconds.toString(),
                      "Timestamp (milliseconds)"
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Microseconds</p>
                  <p className="font-mono text-lg">
                    {currentTimestamp.microseconds}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      currentTimestamp.microseconds.toString(),
                      "Timestamp (microseconds)"
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Human Readable (UTC)
              </p>
              <p className="font-mono">{new Date().toISOString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Converter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Timestamp Converter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input Controls */}
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
                    <SelectItem value="timestamp">Unix Timestamp</SelectItem>
                    <SelectItem value="datetime">Date/Time String</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {state.inputType === "timestamp" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Timestamp Format
                  </label>
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
                      <SelectItem value="milliseconds">Milliseconds</SelectItem>
                      <SelectItem value="microseconds">Microseconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <Select
                    value={state.selectedTimezone}
                    onValueChange={(value) =>
                      setState((s) => ({ ...s, selectedTimezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {engine.current.getTimezones().map((tz) => (
                        <SelectItem key={tz.id} value={tz.id}>
                          {tz.name} ({tz.abbreviation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Input Field */}
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

            {/* Results */}
            {result && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Conversion Results</h4>

                {/* Timestamp Formats */}
                <div>
                  <h5 className="text-sm font-medium mb-2">
                    Timestamp Formats
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-xs text-muted-foreground">Seconds</p>
                        <p className="font-mono text-sm">
                          {result.timestamp.seconds}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopy(
                            result.timestamp.seconds.toString(),
                            "Seconds"
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Milliseconds
                        </p>
                        <p className="font-mono text-sm">
                          {result.timestamp.milliseconds}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopy(
                            result.timestamp.milliseconds.toString(),
                            "Milliseconds"
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Microseconds
                        </p>
                        <p className="font-mono text-sm">
                          {result.timestamp.microseconds}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopy(
                            result.timestamp.microseconds.toString(),
                            "Microseconds"
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Date Formats */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Date Formats</h5>
                  <div className="space-y-2">
                    {Object.entries(result.formatted).map(([format, value]) => (
                      <div
                        key={format}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground capitalize">
                            {format.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="font-mono text-sm truncate">{value}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(value, format)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relative Time */}
                {result.relative.past && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Relative Time</h5>
                    <div className="p-2 bg-muted rounded">
                      <Badge variant="secondary">{result.relative.past}</Badge>
                    </div>
                  </div>
                )}

                {/* Timezones */}
                {state.showTimezones && result.timezones.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Multiple Timezones
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.timezones.slice(0, 6).map((tz) => (
                        <div
                          key={tz.timezone.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              {tz.timezone.abbreviation}
                            </p>
                            <p className="font-mono text-sm truncate">
                              {tz.formatted}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleCopy(tz.formatted, tz.timezone.abbreviation)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Converter */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Timestamps (one per line)
              </label>
              <Textarea
                value={state.batchInput}
                onChange={(e) =>
                  setState((s) => ({ ...s, batchInput: e.target.value }))
                }
                placeholder="1704067200&#10;1704153600&#10;1704240000"
                rows={5}
                className="font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleBatchConvert}
                disabled={state.isProcessing || !state.batchInput.trim()}
              >
                Convert All
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setState((s) => ({ ...s, batchInput: "", batchResults: [] }))
                }
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={state.batchResults.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {state.batchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h5 className="text-sm font-medium">
                  Results ({state.batchResults.length})
                </h5>
                {state.batchResults.map((result, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-mono text-xs text-muted-foreground">
                          {result.input}
                        </p>
                        <p className="font-mono">{result.formatted.iso8601}</p>
                        {result.relative.past && (
                          <Badge variant="outline" className="text-xs">
                            {result.relative.past}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopy(result.formatted.iso8601, "ISO 8601")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-3">Keyboard Shortcuts & Tips</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">Shortcuts</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                      Ctrl+C
                    </kbd>{" "}
                    Copy focused result
                  </li>
                  <li>
                    <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                      Tab
                    </kbd>{" "}
                    Navigate between inputs
                  </li>
                  <li>
                    <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                      Enter
                    </kbd>{" "}
                    Convert timestamp
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Tips</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Conversion happens automatically as you type</li>
                  <li>• Supports various date formats for input</li>
                  <li>• Export batch results to CSV for analysis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
