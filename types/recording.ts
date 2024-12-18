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
}
