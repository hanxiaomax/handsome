import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "@/components/homepage";
import ProgrammerCalculator from "@/tools/programmer-calculator/ui";
import { FavoritesProvider } from "@/contexts/favorites-context";

function App() {
  return (
    <FavoritesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route
            path="/tools/programmer-calculator"
            element={<ProgrammerCalculator />}
          />
        </Routes>
      </Router>
    </FavoritesProvider>
  );
}

export default App;
