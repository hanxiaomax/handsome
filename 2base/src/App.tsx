import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "@/components/homepage";
import ProgrammerCalculator from "@/tools/programmer-calculator/ui";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/tools/programmer-calculator"
          element={<ProgrammerCalculator />}
        />
      </Routes>
    </Router>
  );
}

export default App;
