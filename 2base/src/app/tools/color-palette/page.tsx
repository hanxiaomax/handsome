import React, { Suspense, lazy } from "react";
import { RefreshCw } from "lucide-react";

const ColorPalette = lazy(() => import("@/tools/color-palette/ui"));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Color Palette...</p>
      </div>
    </div>
  );
}

export default function ColorPalettePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ColorPalette />
    </Suspense>
  );
}
