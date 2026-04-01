import {
  createBrowserRouter,
  Outlet,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AuthProvider } from "@/components/auth";
import { ToastProvider } from "@/components/shared";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Pair from "@/pages/Pair";
import Player from "@/pages/Player";
import Settings from "@/pages/Settings";

function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Outlet />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/pair", element: <Pair /> },
      { path: "/player", element: <Player /> },
      { path: "/settings", element: <Settings /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
