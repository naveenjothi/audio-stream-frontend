import { signalingClient, extractData } from "../client";
import type {
  DevicePairing,
  GeneratePairCodeRequest,
  ConnectPairCodeRequest,
} from "@/types/api";

/**
 * Generate a 6-digit pairing code (Mobile flow)
 * Call after registering the mobile device
 */
export async function generatePairCode(
  mobileDeviceId: string
): Promise<DevicePairing> {
  const request: GeneratePairCodeRequest = {
    mobile_device_id: mobileDeviceId,
  };
  const response = await signalingClient.post<{ data: DevicePairing }>(
    "/v1/pairing/code",
    request
  );
  return extractData(response);
}

/**
 * Connect using a pairing code (Browser flow)
 * Call after registering the browser device
 */
export async function connectWithPairCode(
  browserDeviceId: string,
  pairCode: string
): Promise<DevicePairing> {
  const request: ConnectPairCodeRequest = {
    browser_device_id: browserDeviceId,
    pair_code: pairCode,
  };
  const response = await signalingClient.post<{ data: DevicePairing }>(
    "/v1/pairing/connect",
    request
  );
  return extractData(response);
}

/**
 * Get the current active pairing for the user
 */
export async function getActivePairing(): Promise<DevicePairing> {
  const response = await signalingClient.get<{ data: DevicePairing }>(
    "/v1/pairing/active"
  );
  return extractData(response);
}
