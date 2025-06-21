import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Monitor,
  Square,
  Circle,
  Image,
  User,
  BarChart3,
  RefreshCw,
  Download,
  Save,
} from "lucide-react";

// 导入新的封装系统
import { useToolButtons } from "@/hooks/use-tool-buttons";
import { useToolDialogs } from "@/hooks/use-tool-dialogs";
import { toolInfo } from "./toolInfo";

interface DemoState extends Record<string, unknown> {
  activeDemo: string;
  showAnimation: boolean;
  skeletonCount: number;
  refreshCounter: number;
}

export default function LayoutDemo() {
  // 工具状态
  const [demoState, setDemoState] = useState<DemoState>({
    activeDemo: "basic",
    showAnimation: true,
    skeletonCount: 3,
    refreshCounter: 0,
  });

  // 使用新的封装系统
  const toolButtons = useToolButtons(toolInfo, demoState);
  const dialogs = useToolDialogs();

  // 恢复工具状态
  toolButtons.restoreToolState((state: Record<string, unknown>) => {
    if (state.demoState) {
      setDemoState(state.demoState as DemoState);
    }
  });

  // 按钮处理函数
  const handleRefresh = () => {
    setDemoState((prev) => ({
      ...prev,
      refreshCounter: prev.refreshCounter + 1,
    }));
    dialogs.showSuccess(
      "Refreshed!",
      `Demo has been refreshed. Counter: ${demoState.refreshCounter + 1}`
    );
  };

  const handleDownload = () => {
    dialogs.showConfirm(
      "Download Demo Data",
      "Are you sure you want to download the demo data as JSON?",
      () => {
        const dataStr = JSON.stringify(demoState, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "skeleton-demo-state.json";
        link.click();
        URL.revokeObjectURL(url);

        dialogs.showSuccess(
          "Downloaded!",
          "Demo state has been downloaded successfully."
        );
      }
    );
  };

  const handleSave = () => {
    localStorage.setItem("skeleton-demo-state", JSON.stringify(demoState));
    dialogs.showSuccess("Saved!", "Demo state has been saved to localStorage.");
  };

  const handleShowInfo = () => {
    const infoContent = (
      <div className="space-y-4">
        <p>
          This is an enhanced Skeleton Demo tool showcasing the new button
          management system.
        </p>
        <div className="space-y-2">
          <h4 className="font-medium">Features:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Preset button types with automatic icons</li>
            <li>Integrated dialog management</li>
            <li>Standardized tool state handling</li>
            <li>Automatic minimize/restore functionality</li>
            <li>One-line button registration</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Current State:</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(demoState, null, 2)}
          </pre>
        </div>
      </div>
    );
    dialogs.showInfo("Enhanced Skeleton Demo", infoContent);
  };

  const handleShowSettings = () => {
    const settingsContent = (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="animation-toggle">Show Animation</Label>
          <Switch
            id="animation-toggle"
            checked={demoState.showAnimation}
            onCheckedChange={(checked) =>
              setDemoState((prev) => ({ ...prev, showAnimation: checked }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skeleton-count">
            Skeleton Count: {demoState.skeletonCount}
          </Label>
          <input
            id="skeleton-count"
            type="range"
            min="1"
            max="10"
            value={demoState.skeletonCount}
            onChange={(e) =>
              setDemoState((prev) => ({
                ...prev,
                skeletonCount: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Active Demo</Label>
          <select
            value={demoState.activeDemo}
            onChange={(e) =>
              setDemoState((prev) => ({ ...prev, activeDemo: e.target.value }))
            }
            className="w-full p-2 border rounded"
          >
            <option value="basic">Basic Skeletons</option>
            <option value="profile">Profile Components</option>
            <option value="data">Data Components</option>
            <option value="media">Media Components</option>
          </select>
        </div>

        <Button
          onClick={() => {
            setDemoState({
              activeDemo: "basic",
              showAnimation: true,
              skeletonCount: 3,
              refreshCounter: 0,
            });
            dialogs.closeDialog("settings");
            dialogs.showSuccess(
              "Reset Complete",
              "All settings have been reset to defaults."
            );
          }}
          variant="outline"
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </div>
    );
    dialogs.showSettings("Demo Settings", settingsContent);
  };

  // 注册按钮（使用新的封装系统）
  useEffect(() => {
    // 使用预设按钮快速注册
    toolButtons.addPresetButton("refresh", handleRefresh);
    toolButtons.addPresetButton("download", handleDownload);
    toolButtons.addPresetButton("save", handleSave);
    toolButtons.addPresetButton("info", handleShowInfo);
    toolButtons.addPresetButton("settings", handleShowSettings);
  }, [toolButtons]);

  // 渲染骨架屏组件
  const renderSkeletons = () => {
    return Array.from({ length: demoState.skeletonCount }, (_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    ));
  };

  return (
    <>
      <ToolLayout
        toolName={toolInfo.name}
        toolDescription={toolInfo.description}
        customButtons={toolButtons.customButtons}
        onMinimize={toolButtons.handleMinimize}
        onToggleFavorite={toolButtons.handleToggleFavorite}
        isFavorite={toolButtons.isFavorite}
      >
        {/* Main Content Container */}
        <div className="w-full p-6 space-y-6 mt-5">
          {/* Header Section */}
          <div
            id="header-section"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Enhanced Skeleton Demo</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Refresh Count: {demoState.refreshCounter}
            </div>
          </div>

          {/* Status Banner */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                  <span className="text-sm font-medium">
                    Enhanced System Active
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Animation: {demoState.showAnimation ? "On" : "Off"} | Count:{" "}
                  {demoState.skeletonCount} | Mode: {demoState.activeDemo}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Skeleton Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square className="w-5 h-5" />
                Dynamic Skeletons ({demoState.skeletonCount} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderSkeletons()}
              </div>
            </CardContent>
          </Card>

          {/* Avatar and Profile Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">User Profile</h4>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Card Header</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Display Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Data Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Table Skeleton */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Table Structure</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-18" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Chart Area */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Chart Area</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <div className="flex gap-4 justify-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-18" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media and Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Media Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Image Placeholder</h4>
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Card with Image</h4>
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full rounded" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Gallery Grid</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-16 w-full rounded" />
                    <Skeleton className="h-16 w-full rounded" />
                    <Skeleton className="h-16 w-full rounded" />
                    <Skeleton className="h-16 w-full rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="w-5 h-5" />
                Form Skeletons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Input Fields</h4>
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Action Buttons</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-16" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Demo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Interactive Demo Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Demo
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download State
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save State
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Use the toolbar buttons above to access advanced features like
                settings, info, and more.
              </div>
            </CardContent>
          </Card>
        </div>
      </ToolLayout>

      {/* Render Dialogs */}
      {dialogs.openDialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          open={dialog.isOpen}
          onOpenChange={() => dialogs.closeDialog(dialog.id)}
        >
          <DialogContent
            className={`sm:max-w-md ${
              dialog.size === "lg" ? "sm:max-w-lg" : ""
            }`}
          >
            <DialogHeader>
              <DialogTitle>{dialog.title}</DialogTitle>
              {dialog.description && (
                <DialogDescription>{dialog.description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="mt-4">{dialog.content}</div>
            {dialog.footer && <div className="mt-4">{dialog.footer}</div>}
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
