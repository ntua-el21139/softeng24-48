import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home1 from "./pages/Home1";
import ImportTollData from "./pages/ImportTollData";
import Statistics from "./pages/Statistics";
import InteractiveMap from "./pages/InteractiveMap";
import ViewDebts from "./pages/ViewDebts";
import NotFound from "./pages/NotFound";
import "./styles/global.css"; // Import global styles
import Header from "./components/Header";
import { HelmetProvider } from 'react-helmet-async';

// Create a wrapper component to handle the conditional header rendering
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen w-full">
      {!isLoginPage && <Header />}
      <main className={!isLoginPage ? "pt-[120px] md:pt-[80px]" : "h-screen"}>
        <div className={isLoginPage ? "container-fluid h-full" : "container-fluid-padded"}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home1" element={<Home1 />} />
            <Route path="/importtolldata" element={<ImportTollData />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/interactivemap" element={<InteractiveMap />} />
            <Route path="/viewdebts" element={<ViewDebts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;