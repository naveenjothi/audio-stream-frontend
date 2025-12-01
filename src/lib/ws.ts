import { getIdToken } from "./firebase";
import type { SignalingMessage, PlaybackEvent } from "@/types";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8080/ws";

type MessageHandler = (data: unknown) => void;
type CloseHandler = (event: CloseEvent) => void;
type ErrorHandler = (error: Event) => void;

interface WebSocketClientOptions {
  onMessage?: MessageHandler;
  onClose?: CloseHandler;
  onError?: ErrorHandler;
  onOpen?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private endpoint: string;
  private options: WebSocketClientOptions;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isClosedIntentionally = false;

  constructor(endpoint: string, options: WebSocketClientOptions = {}) {
    this.endpoint = endpoint;
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...options,
    };
  }

  async connect(): Promise<void> {
    const token = await getIdToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const url = `${WS_BASE_URL}${this.endpoint}?token=${encodeURIComponent(
      token
    )}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        this.isClosedIntentionally = false;

        this.ws.onopen = () => {
          console.log(`WebSocket connected: ${this.endpoint}`);
          this.reconnectAttempts = 0;
          this.options.onOpen?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.options.onMessage?.(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocket closed: ${this.endpoint}`, event);
          this.options.onClose?.(event);

          if (this.options.reconnect && !this.isClosedIntentionally) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error(`WebSocket error: ${this.endpoint}`, error);
          this.options.onError?.(error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 10)) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting reconnect ${this.reconnectAttempts}/${this.options.maxReconnectAttempts}`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, this.options.reconnectInterval);
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }

  close(): void {
    this.isClosedIntentionally = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Signaling WebSocket for WebRTC
export function createSignalingClient(
  onMessage: (message: SignalingMessage) => void,
  onConnectionChange?: (connected: boolean) => void
): WebSocketClient {
  return new WebSocketClient("/rtc/signal", {
    onMessage: (data) => onMessage(data as SignalingMessage),
    onOpen: () => onConnectionChange?.(true),
    onClose: () => onConnectionChange?.(false),
    reconnect: true,
  });
}

// Playback State WebSocket
export function createPlaybackClient(
  onEvent: (event: PlaybackEvent) => void,
  onConnectionChange?: (connected: boolean) => void
): WebSocketClient {
  return new WebSocketClient("/playback/state", {
    onMessage: (data) => onEvent(data as PlaybackEvent),
    onOpen: () => onConnectionChange?.(true),
    onClose: () => onConnectionChange?.(false),
    reconnect: true,
  });
}

export { WebSocketClient };
