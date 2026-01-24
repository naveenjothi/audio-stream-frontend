"use client";

import { Smartphone, Wifi, WifiOff, Loader2 } from "lucide-react";
import type { Device } from "@/types/api";
import clsx from "clsx";

interface DeviceStatusProps {
  device: Device | null;
  connectionStatus: "disconnected" | "connecting" | "connected";
  compact?: boolean;
}

export function DeviceStatus({
  device,
  connectionStatus,
  compact = false,
}: DeviceStatusProps) {
  if (!device) {
    return (
      <div
        className={clsx(
          "flex items-center gap-2 text-dark-400",
          compact && "text-sm"
        )}
      >
        <Smartphone className={clsx(compact ? "w-4 h-4" : "w-5 h-5")} />
        <span>No device connected</span>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-primary-500";
      case "connecting":
        return "text-yellow-500";
      default:
        return "text-dark-400";
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Wifi
            className={clsx(
              compact ? "w-4 h-4" : "w-5 h-5",
              "text-primary-500"
            )}
          />
        );
      case "connecting":
        return (
          <Loader2
            className={clsx(
              compact ? "w-4 h-4" : "w-5 h-5",
              "text-yellow-500 animate-spin"
            )}
          />
        );
      default:
        return (
          <WifiOff
            className={clsx(compact ? "w-4 h-4" : "w-5 h-5", "text-dark-400")}
          />
        );
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      default:
        return "Offline";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={clsx("text-sm font-medium", getStatusColor())}>
          {device.device_name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
      <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
        <Smartphone className="w-6 h-6 text-dark-300" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{device.device_name}</p>
        <div className="flex items-center gap-2 mt-1">
          {getStatusIcon()}
          <span className={clsx("text-sm", getStatusColor())}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
}
