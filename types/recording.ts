export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
}

export interface CursorPosition {
  x: number;
  y: number;
  visible?: boolean;
}

export interface ExportConfig {
  format: "mp4" | "webm" | "gif";
  quality: "high" | "medium" | "low";
  textOverlay?: TextOverlay;
}

export interface ZoomEvent {
  id: string;
  startTime: number;
  duration: number;
  zoomLevel: number;
  cursorPosition: CursorPosition;
}

export interface TimelineState {
  recordedBlob: Blob | null;
  duration: number;
  zoomEvents: ZoomEvent[];
}

export interface TextOverlay {
  text: string;
  x: number;
  y: number;
}
