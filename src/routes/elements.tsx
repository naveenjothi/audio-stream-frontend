import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Pair = lazy(() => import("@/pages/Pair"));
const Player = lazy(() => import("@/pages/Player"));
const Settings = lazy(() => import("@/pages/Settings"));

export function HomeElement() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

export function LoginElement() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

export function DashboardElement() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}

export function PairElement() {
  return (
    <Suspense>
      <Pair />
    </Suspense>
  );
}

export function PlayerElement() {
  return (
    <Suspense>
      <Player />
    </Suspense>
  );
}

export function SettingsElement() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
}

export function CatchAllElement() {
  return (
    <Suspense>
      <Navigate to="/" replace />
    </Suspense>
  );
}
