import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "@/components/homepage";
import ProgrammerCalculator from "@/tools/programmer-calculator/ui";
import UUIDGenerator from "@/tools/uuid-generator/ui";
import WorldClock from "@/tools/world-clock/ui";
import FavoritesPage from "@/app/favorites/page";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { MinimizedToolsProvider } from "@/contexts/minimized-tools-context";
import { MinimizedToolsIndicator } from "@/components/layout/minimized-tools-indicator";

function App() {
  return (
    <FavoritesProvider>
      <MinimizedToolsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route
              path="/tools/programmer-calculator"
              element={<ProgrammerCalculator />}
            />
            <Route path="/tools/uuid-generator" element={<UUIDGenerator />} />
            <Route path="/tools/world-clock" element={<WorldClock />} />
          </Routes>
          <MinimizedToolsIndicator />
        </Router>
      </MinimizedToolsProvider>
    </FavoritesProvider>
  );
}

export default App;
