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
