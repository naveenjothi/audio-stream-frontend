import {
  CatchAllElement,
  DashboardElement,
  HomeElement,
  LoginElement,
  PairElement,
  PlayerElement,
  SettingsElement,
} from "./elements";

export const routesConfig = [
  { path: "/", element: <HomeElement /> },
  { path: "/login", element: <LoginElement /> },
  { path: "/dashboard", element: <DashboardElement /> },
  { path: "/pair", element: <PairElement /> },
  { path: "/player", element: <PlayerElement /> },
  { path: "/settings", element: <SettingsElement /> },
  { path: "*", element: <CatchAllElement /> },
];
