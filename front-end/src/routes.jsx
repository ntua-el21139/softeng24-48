import React from "react";
import { useRoutes } from "react-router-dom";
import Home from "pages/Home";
import NotFound from "pages/NotFound";
import Login from "pages/Login";
import Home1 from "pages/Home1";
import ImportTollData from "pages/ImportTollData";
import Statistics from "pages/Statistics";
import InteractiveMap from "pages/InteractiveMap";
import ViewDebts from "pages/ViewDebts";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <Home /> },
    { path: "*", element: <NotFound /> },
    { path: "login", element: <Login /> },
    { path: "home1", element: <Home1 /> },
    { path: "importtolldata", element: <ImportTollData /> },
    { path: "statistics", element: <Statistics /> },
    { path: "interactivemap", element: <InteractiveMap /> },
    { path: "viewdebts", element: <ViewDebts /> },
  ]);

  return element;
};

export default ProjectRoutes;