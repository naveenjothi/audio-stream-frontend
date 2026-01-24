import { signalingClient, extractData } from "../client";
import type { Device, RegisterDeviceRequest } from "@/types/api";

/**
 * Register a device (mobile or browser)
 * Mobile devices should set is_source = true
 */
export async function registerDevice(
  request: RegisterDeviceRequest
): Promise<Device> {
  const response = await signalingClient.post<{ data: Device }>(
    "/v1/devices/register",
    request
  );
  return extractData(response);
}
