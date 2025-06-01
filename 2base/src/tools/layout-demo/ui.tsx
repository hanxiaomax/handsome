import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToolLayout } from "@/components/layout/tool-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Square, Circle, Image, User, BarChart3 } from "lucide-react";

export default function LayoutDemo() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClose = () => {
    navigate("/");
  };

  const handleMinimize = () => {
    console.log("Minimize to drawer");
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <ToolLayout
      toolName="Skeleton Components Demo"
      toolDescription="Demonstration of skeleton loading states and placeholder components"
      onClose={handleClose}
      onMinimize={handleMinimize}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
      {/* Main Content Container */}
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Header Section */}
        <div id="header-section" className="flex items-center gap-3">
          <Monitor className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Skeleton Components</h1>
        </div>

        {/* Basic Skeleton Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="w-5 h-5" />
              Basic Skeletons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Text Lines</h4>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Buttons</h4>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-16" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Badges</h4>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </div>
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
      </div>
    </ToolLayout>
  );
}
