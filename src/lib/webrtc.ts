import { SignalingMessage } from "@/types";
import { WebSocketClient, createSignalingClient } from "./ws";

interface WebRTCManagerOptions {
  onTrack?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  onError?: (error: Error) => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // Add TURN servers here for production
];

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private signalingClient: WebSocketClient | null = null;
  private localDeviceId: string;
  private remoteDeviceId: string | null = null;
  private options: WebRTCManagerOptions;
  private audioStream: MediaStream | null = null;

  constructor(deviceId: string, options: WebRTCManagerOptions = {}) {
    this.localDeviceId = deviceId;
    this.options = options;
  }

  async initialize(): Promise<void> {
    // Create peer connection
    this.pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    // Handle incoming tracks (audio from mobile device)
    this.pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      if (event.streams && event.streams[0]) {
        this.audioStream = event.streams[0];
        this.options.onTrack?.(event.streams[0]);
      }
    };

    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.remoteDeviceId) {
        this.signalingClient?.send({
          type: "candidate",
          from: this.localDeviceId,
          to: this.remoteDeviceId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Connection state changes
    this.pc.onconnectionstatechange = () => {
      console.log("Connection state:", this.pc?.connectionState);
      this.options.onConnectionStateChange?.(
        this.pc?.connectionState as RTCPeerConnectionState
      );
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", this.pc?.iceConnectionState);
      this.options.onIceConnectionStateChange?.(
        this.pc?.iceConnectionState as RTCIceConnectionState
      );
    };

    // Initialize signaling
    this.signalingClient = createSignalingClient(
      this.handleSignalingMessage.bind(this),
      (connected) => {
        console.log("Signaling connected:", connected);
      }
    );

    await this.signalingClient.connect();
  }

  private async handleSignalingMessage(
    message: SignalingMessage
  ): Promise<void> {
    // Only process messages meant for this device
    if (message.to !== this.localDeviceId) return;

    try {
      switch (message.type) {
        case "offer":
          await this.handleOffer(message);
          break;
        case "answer":
          await this.handleAnswer(message);
          break;
        case "candidate":
          await this.handleCandidate(message);
          break;
      }
    } catch (error) {
      console.error("Error handling signaling message:", error);
      this.options.onError?.(error as Error);
    }
  }

  private async handleOffer(message: SignalingMessage): Promise<void> {
    if (!this.pc || !message.sdp) return;

    this.remoteDeviceId = message.from;

    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp: message.sdp })
    );

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.signalingClient?.send({
      type: "answer",
      from: this.localDeviceId,
      to: this.remoteDeviceId,
      sdp: answer.sdp,
    });
  }

  private async handleAnswer(message: SignalingMessage): Promise<void> {
    if (!this.pc || !message.sdp) return;

    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: "answer", sdp: message.sdp })
    );
  }

  private async handleCandidate(message: SignalingMessage): Promise<void> {
    if (!this.pc || !message.candidate) return;

    await this.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
  }

  // For initiating a connection to a remote device (if browser needs to send offer)
  async connectToDevice(remoteDeviceId: string): Promise<void> {
    if (!this.pc) {
      throw new Error("WebRTC not initialized");
    }

    this.remoteDeviceId = remoteDeviceId;

    // Add transceiver for receiving audio
    this.pc.addTransceiver("audio", { direction: "recvonly" });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.signalingClient?.send({
      type: "offer",
      from: this.localDeviceId,
      to: remoteDeviceId,
      sdp: offer.sdp,
    });
  }

  getAudioStream(): MediaStream | null {
    return this.audioStream;
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.pc?.connectionState ?? null;
  }

  close(): void {
    this.signalingClient?.close();
    this.pc?.close();
    this.pc = null;
    this.audioStream = null;
  }
}

// Singleton-ish factory for managing WebRTC connection
let webRTCInstance: WebRTCManager | null = null;

export function getWebRTCManager(
  deviceId: string,
  options?: WebRTCManagerOptions
): WebRTCManager {
  if (!webRTCInstance) {
    webRTCInstance = new WebRTCManager(deviceId, options);
  }
  return webRTCInstance;
}

export function destroyWebRTCManager(): void {
  webRTCInstance?.close();
  webRTCInstance = null;
}
