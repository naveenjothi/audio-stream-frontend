import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Pair from "@/pages/Pair";
import Player from "@/pages/Player";
import Settings from "@/pages/Settings";
import { Navigate } from "react-router-dom";

const routesConfig = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/pair", element: <Pair /> },
  { path: "/player", element: <Player /> },
  { path: "/settings", element: <Settings /> },
  { path: "*", element: <Navigate to="/" replace /> },
];
