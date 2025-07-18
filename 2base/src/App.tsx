import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/app/landing-page";
import { Homepage } from "@/app/homepage";
import ProgrammerCalculator from "@/tools/programmer-calculator/ui";
import UUIDGenerator from "@/tools/uuid-generator/ui";
import UnitConverter from "@/tools/unit-converter/ui";
import UnixTimestampConverter from "@/tools/unix-timestamp-converter/ui";
import EmojiLibrary from "@/tools/emoji-library/ui";
import ColorPalette from "@/tools/color-palette/ui";
import XMLParser from "@/tools/xml-parser/ui";
import LayoutDemo from "@/tools/layout-demo/ui";
import Calculator from "@/tools/calculator/ui";
import FavoritesPage from "@/app/favorites";
import { MinimizedToolsIndicator } from "@/components/layout/minimized-tools-indicator";
import { Toaster } from "@/components/ui/sonner";

function App() {
  // Get base path from environment
  const basename = import.meta.env.PROD ? "/handsome" : "";

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tools" element={<Homepage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route
          path="/tools/programmer-calculator"
          element={<ProgrammerCalculator />}
        />
        <Route path="/tools/uuid-generator" element={<UUIDGenerator />} />
        <Route path="/tools/unit-converter" element={<UnitConverter />} />
        <Route
          path="/tools/unix-timestamp-converter"
          element={<UnixTimestampConverter />}
        />
        <Route path="/tools/emoji-library" element={<EmojiLibrary />} />
        <Route path="/tools/color-palette" element={<ColorPalette />} />
        <Route path="/tools/xml-parser" element={<XMLParser />} />
        <Route path="/tools/layout-demo" element={<LayoutDemo />} />
        <Route path="/tools/calculator" element={<Calculator />} />
      </Routes>
      <MinimizedToolsIndicator />
      <Toaster />
    </Router>
  );
}

export default App;
