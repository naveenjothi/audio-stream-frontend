import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Device } from "@/types";

interface DeviceState {
  pairedDevice: Device | null;
  isPairing: boolean;
  pairingError: string | null;
  connectionStatus: "disconnected" | "connecting" | "connected";
  setPairedDevice: (device: Device | null) => void;
  setIsPairing: (isPairing: boolean) => void;
  setPairingError: (error: string | null) => void;
  setConnectionStatus: (
    status: "disconnected" | "connecting" | "connected"
  ) => void;
  updateDeviceStatus: (status: Device["status"]) => void;
  clearDevice: () => void;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
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
      updateDeviceStatus: (status) => {
        const device = get().pairedDevice;
        if (device) {
          set({
            pairedDevice: { ...device, status },
          });
        }
      },
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
    }
  )
);
