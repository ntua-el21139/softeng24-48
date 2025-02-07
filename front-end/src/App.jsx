import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home1 from "./pages/Home1";
import ImportTollData from "./pages/ImportTollData";
import Statistics from "./pages/Statistics";
import InteractiveMap from "./pages/InteractiveMap";
import ViewDebts from "./pages/ViewDebts";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home1" element={<Home1 />} />
        <Route path="/importtolldata" element={<ImportTollData />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/interactivemap" element={<InteractiveMap />} />
        <Route path="/viewdebts" element={<ViewDebts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;