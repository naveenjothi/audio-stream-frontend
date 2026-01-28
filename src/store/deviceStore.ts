import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Device } from "@/types/api";

interface DeviceState {
  pairedDevice: Device | null;
  isPairing: boolean;
  pairingError: string | null;
  connectionStatus: "disconnected" | "connecting" | "connected";
  setPairedDevice: (device: Device | null) => void;
  setIsPairing: (isPairing: boolean) => void;
  setPairingError: (error: string | null) => void;
  setConnectionStatus: (
    status: "disconnected" | "connecting" | "connected",
  ) => void;
  clearDevice: () => void;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      pairedDevice: null,
      isPairing: false,
      pairingError: null,
      connectionStatus: "disconnected",
      setPairedDevice: (device) =>
        set({
          pairedDevice: device,
          pairingError: null,
        }),
      setIsPairing: (isPairing) => set({ isPairing }),
      setPairingError: (error) =>
        set({ pairingError: error, isPairing: false }),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      clearDevice: () =>
        set({
          pairedDevice: null,
          connectionStatus: "disconnected",
          pairingError: null,
        }),
    }),
    {
      name: "device-storage",
      partialize: (state) => ({
        pairedDevice: state.pairedDevice,
      }),
    },
  ),
);
