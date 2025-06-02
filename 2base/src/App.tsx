import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "@/app/homepage";
import ProgrammerCalculator from "@/tools/programmer-calculator/ui";
import UUIDGenerator from "@/tools/uuid-generator/ui";
import WorldClock from "@/tools/world-clock/ui";
import UnitConverter from "@/tools/unit-converter/ui";
import UnixTimestampConverter from "@/tools/unix-timestamp-converter/ui";
import MarkdownEditor from "@/tools/markdown-editor/ui";
import EmojiLibrary from "@/tools/emoji-library/ui";
import ColorPalette from "@/tools/color-palette/ui";
import ProductChartGenerator from "@/tools/product-chart-generator/ui";
import XMLParser from "@/tools/xml-parser/ui";
import LayoutDemo from "@/tools/layout-demo/ui";
import FavoritesPage from "@/app/favorites";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { MinimizedToolsProvider } from "@/contexts/minimized-tools-context";
import { MinimizedToolsIndicator } from "@/components/layout/minimized-tools-indicator";
import { Toaster } from "@/components/ui/sonner";

function App() {
  // Get base path from environment
  const basename = import.meta.env.PROD ? "/handsome" : "";

  return (
    <FavoritesProvider>
      <MinimizedToolsProvider>
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route
              path="/tools/programmer-calculator"
              element={<ProgrammerCalculator />}
            />
            <Route path="/tools/uuid-generator" element={<UUIDGenerator />} />
            <Route path="/tools/world-clock" element={<WorldClock />} />
            <Route path="/tools/unit-converter" element={<UnitConverter />} />
            <Route
              path="/tools/unix-timestamp-converter"
              element={<UnixTimestampConverter />}
            />
            <Route path="/tools/markdown-editor" element={<MarkdownEditor />} />
            <Route path="/tools/emoji-library" element={<EmojiLibrary />} />
            <Route path="/tools/color-palette" element={<ColorPalette />} />
            <Route
              path="/tools/product-chart-generator"
              element={<ProductChartGenerator />}
            />
            <Route path="/tools/xml-parser" element={<XMLParser />} />
            <Route path="/tools/layout-demo" element={<LayoutDemo />} />
          </Routes>
          <MinimizedToolsIndicator />
          <Toaster />
        </Router>
      </MinimizedToolsProvider>
    </FavoritesProvider>
  );
}

export default App;
