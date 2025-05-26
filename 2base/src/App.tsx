import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "@/components/homepage";
import ProgrammerCalculator from "@/tools/programmer-calculator/ui";
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
            <Route
              path="/tools/programmer-calculator"
              element={<ProgrammerCalculator />}
            />
          </Routes>
          <MinimizedToolsIndicator />
        </Router>
      </MinimizedToolsProvider>
    </FavoritesProvider>
  );
}

export default App;
