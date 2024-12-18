// src/types/index.ts
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
}

export interface ZoomConfig {
  level: number;
  smoothness: number;
  enabled: boolean;
}
