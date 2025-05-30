"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  BarChart3,
  Radar,
  Target,
  Grid3X3,
  TrendingUp,
  Download,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
} from "lucide-react";

import { ToolLayout } from "@/components/layout/tool-layout";
import { ProductChartEngine } from "./lib";
import { toolInfo } from "./toolInfo";
import type {
  ChartType,
  ChartConfig,
  RadarChartConfig,
  SWOTConfig,
  PriorityMatrixConfig,
  KanoModelConfig,
  PriorityItem,
  KanoFeature,
} from "./lib/types";
import { ChartCanvas } from "./ChartCanvas";

export default function ProductChartGenerator() {
  const [engine] = useState(() => new ProductChartEngine());
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null);
  const [selectedType, setSelectedType] = useState<ChartType>("radar");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Chart type configurations
  const chartTypes = [
    {
      id: "radar",
      name: "Radar Chart",
      icon: Radar,
      description: "Multi-dimensional comparison",
    },
    {
      id: "swot",
      name: "SWOT Analysis",
      icon: Grid3X3,
      description: "Strategic analysis framework",
    },
    {
      id: "priority-matrix",
      name: "Priority Matrix",
      icon: Target,
      description: "Effort vs Impact analysis",
    },
    {
      id: "kano-model",
      name: "Kano Model",
      icon: TrendingUp,
      description: "Feature satisfaction analysis",
    },
  ] as const;

  // Initialize with default chart
  useEffect(() => {
    try {
      const chart = engine.createChart({ type: selectedType });
      setCurrentChart(chart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chart");
    }
  }, [engine, selectedType]);

  const handleTypeSelect = useCallback(
    (type: ChartType) => {
      try {
        setSelectedType(type);
        const chart = engine.createChart({ type });
        setCurrentChart(chart);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create chart");
      }
    },
    [engine]
  );

  const handleUpdateChart = useCallback(
    (updates: Partial<ChartConfig>) => {
      if (!currentChart) return;

      try {
        const updatedChart = engine.updateChart(currentChart.id, updates);
        setCurrentChart(updatedChart);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update chart");
      }
    },
    [engine, currentChart]
  );

  const handleUpdateChartData = useCallback(
    (newChart: ChartConfig) => {
      try {
        const updatedChart = engine.updateChart(newChart.id, newChart);
        setCurrentChart(updatedChart);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update chart data"
        );
      }
    },
    [engine]
  );

  const handleExport = useCallback(async () => {
    if (!currentChart) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const blob = await engine.exportChart(currentChart);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentChart.title
        .replace(/\s+/g, "-")
        .toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      clearInterval(progressInterval);
      setExportProgress(100);

      console.log("Export Successful: Chart exported successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, [engine, currentChart]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!currentChart) return;

    try {
      const success = await engine.exportToClipboard(currentChart);
      if (success) {
        console.log("Copied to Clipboard: Chart data copied to clipboard");
      } else {
        throw new Error("Failed to copy to clipboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copy failed");
    }
  }, [engine, currentChart]);

  const handleReset = useCallback(() => {
    try {
      const chart = engine.createChart({ type: selectedType });
      setCurrentChart(chart);
      setError(null);
      console.log("Chart Reset: Chart has been reset to default values");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    }
  }, [engine, selectedType]);

  const handleClose = useCallback(() => {
    window.location.href = "/";
  }, []);

  const handleMinimize = useCallback(() => {
    // Implement minimize functionality if needed
    console.log("Minimize not implemented");
  }, []);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

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
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Types Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Chart Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {chartTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleTypeSelect(type.id as ChartType)}
                  >
                    <div className="flex items-center gap-3">
                      <type.icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Quick Templates</Label>
                <div className="mt-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    ⚡ Quick Start
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    📊 Competitive Analysis
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    🎯 Product Strategy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    👥 Team Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Canvas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Chart Preview</span>
                <Badge variant="outline">{currentChart?.type}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted/20 rounded-lg border border-muted overflow-hidden">
                <ChartCanvas chart={currentChart} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={handleExport}
                  disabled={!currentChart || isExporting}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handleCopyToClipboard}
                  disabled={!currentChart}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={!currentChart}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {isExporting && (
                <div className="mt-4">
                  <Progress value={exportProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Exporting... {exportProgress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chart-title">Chart Title</Label>
                    <Input
                      id="chart-title"
                      value={currentChart?.title || ""}
                      onChange={(e) =>
                        handleUpdateChart({ title: e.target.value })
                      }
                      placeholder="Enter chart title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chart-description">Description</Label>
                    <Textarea
                      id="chart-description"
                      value={currentChart?.description || ""}
                      onChange={(e) =>
                        handleUpdateChart({ description: e.target.value })
                      }
                      placeholder="Enter chart description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={handleTypeSelect}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chartTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                  <ChartDataEditor
                    chart={currentChart}
                    onUpdate={handleUpdateChartData}
                  />
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select defaultValue="default">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Palette</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#06B6D4",
                      ].map((color) => (
                        <div
                          key={color}
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Help & Tips */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>
                  Radar Charts: Use 5-7 dimensions for optimal readability
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>
                  SWOT Analysis: Keep items concise, focus on actionable
                  insights
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>⌨️</span>
                <span>
                  Shortcuts: Ctrl+E (Export), Ctrl+S (Save), Ctrl+Z (Undo)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}

// Chart Data Editor Component
function ChartDataEditor({
  chart,
  onUpdate,
}: {
  chart: ChartConfig | null;
  onUpdate: (chart: ChartConfig) => void;
}) {
  if (!chart) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
        <p>No chart selected</p>
      </div>
    );
  }

  switch (chart.type) {
    case "radar":
      return (
        <RadarDataEditor
          chart={chart as RadarChartConfig}
          onUpdate={onUpdate}
        />
      );
    case "swot":
      return <SWOTDataEditor chart={chart as SWOTConfig} onUpdate={onUpdate} />;
    case "priority-matrix":
      return (
        <PriorityMatrixDataEditor
          chart={chart as PriorityMatrixConfig}
          onUpdate={onUpdate}
        />
      );
    case "kano-model":
      return (
        <KanoModelDataEditor
          chart={chart as KanoModelConfig}
          onUpdate={onUpdate}
        />
      );
    default:
      return (
        <div className="text-center text-muted-foreground py-8">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>Data editor for {chart.type} coming soon</p>
        </div>
      );
  }
}

// Radar Chart Data Editor
function RadarDataEditor({
  chart,
  onUpdate,
}: {
  chart: RadarChartConfig;
  onUpdate: (chart: ChartConfig) => void;
}) {
  const dataset = chart.data?.[0];

  const updateDimension = useCallback(
    (index: number, field: "dimension" | "value", value: string | number) => {
      if (!dataset) return;

      const newChart = { ...chart };
      newChart.data = [...chart.data];
      newChart.data[0] = { ...dataset };
      newChart.data[0].data = [...dataset.data];
      newChart.data[0].data[index] = {
        ...newChart.data[0].data[index],
        [field]: value,
      };
      onUpdate(newChart);
    },
    [chart, dataset, onUpdate]
  );

  const addDimension = useCallback(() => {
    if (!dataset) return;

    const newChart = { ...chart };
    newChart.data = [...chart.data];
    newChart.data[0] = { ...dataset };
    newChart.data[0].data = [
      ...dataset.data,
      { dimension: "New Dimension", value: 5 },
    ];
    onUpdate(newChart);
  }, [chart, dataset, onUpdate]);

  const removeDimension = useCallback(
    (index: number) => {
      if (!dataset || dataset.data.length <= 3) return; // Minimum 3 dimensions

      const newChart = { ...chart };
      newChart.data = [...chart.data];
      newChart.data[0] = { ...dataset };
      newChart.data[0].data = dataset.data.filter((_, i) => i !== index);
      onUpdate(newChart);
    },
    [chart, dataset, onUpdate]
  );

  if (!chart.data || chart.data.length === 0 || !dataset) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Dimensions & Values</Label>
        <Button onClick={addDimension} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {dataset.data.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border rounded"
            >
              <Input
                value={item.dimension}
                onChange={(e) =>
                  updateDimension(index, "dimension", e.target.value)
                }
                placeholder="Dimension name"
                className="flex-1"
              />
              <Input
                type="number"
                value={item.value}
                onChange={(e) =>
                  updateDimension(
                    index,
                    "value",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="Value"
                className="w-20"
                min={chart.scale.min}
                max={chart.scale.max}
              />
              <Button
                onClick={() => removeDimension(index)}
                size="sm"
                variant="ghost"
                disabled={dataset.data.length <= 3}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="text-xs text-muted-foreground">
        Values range: {chart.scale.min} - {chart.scale.max}
      </div>
    </div>
  );
}

// SWOT Data Editor
function SWOTDataEditor({
  chart,
  onUpdate,
}: {
  chart: SWOTConfig;
  onUpdate: (chart: ChartConfig) => void;
}) {
  const updateSWOTItem = useCallback(
    (category: keyof SWOTConfig["data"], index: number, text: string) => {
      const newChart = { ...chart };
      newChart.data = { ...chart.data };
      newChart.data[category] = [...newChart.data[category]];
      newChart.data[category][index] = {
        ...newChart.data[category][index],
        text,
      };
      onUpdate(newChart);
    },
    [chart, onUpdate]
  );

  const addSWOTItem = useCallback(
    (category: keyof SWOTConfig["data"]) => {
      const newChart = { ...chart };
      newChart.data = { ...chart.data };
      newChart.data[category] = [
        ...newChart.data[category],
        {
          id: Date.now().toString(),
          text: "New item",
          priority: newChart.data[category].length + 1,
        },
      ];
      onUpdate(newChart);
    },
    [chart, onUpdate]
  );

  const removeSWOTItem = useCallback(
    (category: keyof SWOTConfig["data"], index: number) => {
      const newChart = { ...chart };
      newChart.data = { ...chart.data };
      newChart.data[category] = newChart.data[category].filter(
        (_, i) => i !== index
      );
      onUpdate(newChart);
    },
    [chart, onUpdate]
  );

  const categories = [
    {
      key: "strengths" as const,
      label: "Strengths",
      color: "border-green-200 bg-green-50",
    },
    {
      key: "weaknesses" as const,
      label: "Weaknesses",
      color: "border-red-200 bg-red-50",
    },
    {
      key: "opportunities" as const,
      label: "Opportunities",
      color: "border-blue-200 bg-blue-50",
    },
    {
      key: "threats" as const,
      label: "Threats",
      color: "border-yellow-200 bg-yellow-50",
    },
  ];

  return (
    <ScrollArea className="h-80">
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.key}
            className={`p-3 rounded border ${category.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium">{category.label}</Label>
              <Button
                onClick={() => addSWOTItem(category.key)}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {chart.data[category.key].map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    value={item.text}
                    onChange={(e) =>
                      updateSWOTItem(category.key, index, e.target.value)
                    }
                    placeholder={`Enter ${category.label.toLowerCase()} item`}
                    className="flex-1 bg-white"
                  />
                  <Button
                    onClick={() => removeSWOTItem(category.key, index)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Priority Matrix Data Editor
function PriorityMatrixDataEditor({
  chart,
  onUpdate,
}: {
  chart: PriorityMatrixConfig;
  onUpdate: (chart: ChartConfig) => void;
}) {
  const updateItem = useCallback(
    (index: number, field: keyof PriorityItem, value: string | number) => {
      const newChart = { ...chart };
      newChart.data = [...chart.data];
      newChart.data[index] = { ...newChart.data[index], [field]: value };
      onUpdate(newChart);
    },
    [chart, onUpdate]
  );

  const addItem = useCallback(() => {
    const newChart = { ...chart };
    newChart.data = [
      ...chart.data,
      {
        id: Date.now().toString(),
        name: "New Feature",
        x: 5,
        y: 5,
        description: "",
      },
    ];
    onUpdate(newChart);
  }, [chart, onUpdate]);

  const removeItem = useCallback(
    (index: number) => {
      const newChart = { ...chart };
      newChart.data = chart.data.filter((_, i) => i !== index);
      onUpdate(newChart);
    },
    [chart, onUpdate]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Features ({chart.data.length})</Label>
        <Button onClick={addItem} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {chart.data.map((item, index) => (
            <div key={item.id} className="p-3 border rounded space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="Feature name"
                  className="flex-1"
                />
                <Button
                  onClick={() => removeItem(index)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Effort (1-10)</Label>
                  <Input
                    type="number"
                    value={item.x}
                    onChange={(e) =>
                      updateItem(index, "x", parseFloat(e.target.value) || 1)
                    }
                    min={1}
                    max={10}
                  />
                </div>
                <div>
                  <Label className="text-xs">Impact (1-10)</Label>
                  <Input
                    type="number"
                    value={item.y}
                    onChange={(e) =>
                      updateItem(index, "y", parseFloat(e.target.value) || 1)
                    }
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              {item.description !== undefined && (
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  placeholder="Description (optional)"
                  className="text-xs"
                />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="text-xs text-muted-foreground">
        Effort: Development complexity • Impact: Business value
      </div>
    </div>
  );
}

// Kano Model Data Editor
function KanoModelDataEditor({
  chart,
  onUpdate,
}: {
  chart: KanoModelConfig;
  onUpdate: (chart: ChartConfig) => void;
}) {
  const updateFeature = useCallback(
    (index: number, field: keyof KanoFeature, value: string | number) => {
      const newChart = { ...chart };
      newChart.data = [...chart.data];
      newChart.data[index] = { ...newChart.data[index], [field]: value };
      onUpdate(newChart);
    },
    [chart, onUpdate]
  );

  const addFeature = useCallback(() => {
    const newChart = { ...chart };
    newChart.data = [
      ...chart.data,
      {
        id: Date.now().toString(),
        name: "New Feature",
        functionality: 0,
        dysfunctionality: 0,
        category: "indifferent" as const,
        description: "",
      },
    ];
    onUpdate(newChart);
  }, [chart, onUpdate]);

  const removeFeature = useCallback(
    (index: number) => {
      const newChart = { ...chart };
      newChart.data = chart.data.filter((_, i) => i !== index);
      onUpdate(newChart);
    },
    [chart, onUpdate]
  );

  const categoryOptions = [
    { value: "must-be", label: "Must-be" },
    { value: "one-dimensional", label: "One-dimensional" },
    { value: "attractive", label: "Attractive" },
    { value: "indifferent", label: "Indifferent" },
    { value: "reverse", label: "Reverse" },
    { value: "questionable", label: "Questionable" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Features ({chart.data.length})</Label>
        <Button onClick={addFeature} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {chart.data.map((feature, index) => (
            <div key={feature.id} className="p-3 border rounded space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={feature.name}
                  onChange={(e) => updateFeature(index, "name", e.target.value)}
                  placeholder="Feature name"
                  className="flex-1"
                />
                <Button
                  onClick={() => removeFeature(index)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Functional (-3 to 3)</Label>
                  <Input
                    type="number"
                    value={feature.functionality}
                    onChange={(e) =>
                      updateFeature(
                        index,
                        "functionality",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min={-3}
                    max={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">Dysfunctional (-3 to 3)</Label>
                  <Input
                    type="number"
                    value={feature.dysfunctionality}
                    onChange={(e) =>
                      updateFeature(
                        index,
                        "dysfunctionality",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min={-3}
                    max={3}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={feature.category}
                  onValueChange={(value) =>
                    updateFeature(index, "category", value)
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="text-xs text-muted-foreground">
        Functional: How happy if present • Dysfunctional: How unhappy if absent
      </div>
    </div>
  );
}
