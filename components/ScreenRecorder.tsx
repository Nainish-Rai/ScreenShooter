// src/components/ScreenRecorder.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { RecordingState } from "@/types";

export default function ScreenRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    stream: null,
    mediaRecorder: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaChunks = useRef<Blob[]>([]);

  // Start screen recording
  const startRecording = async () => {
    try {
      // Request screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Create Media Recorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunks.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(mediaChunks.current, {
          type: "video/webm",
        });
        downloadRecording(recordedBlob);
        mediaChunks.current = [];
      };

      // Update state
      setRecordingState((prev) => ({
        ...prev,
        stream,
        mediaRecorder,
        isRecording: true,
      }));

      // Start preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start recording
      mediaRecorder.start();

      // Handle stream stop
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Failed to start recording. Please make sure you have granted necessary permissions."
      );
    }
  };

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recordingState.mediaRecorder && recordingState.stream) {
      recordingState.mediaRecorder.stop();
      recordingState.stream.getTracks().forEach((track) => track.stop());

      setRecordingState((prev) => ({
        ...prev,
        isRecording: false,
        stream: null,
        mediaRecorder: null,
      }));

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [recordingState.mediaRecorder, recordingState.stream]);

  // Download recording
  const downloadRecording = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screen-recording-${new Date().getTime()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Screen Recorder</h1>

        {/* Preview Container */}
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {!recordingState.isRecording ? (
            <button
              onClick={startRecording}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <circle cx="10" cy="10" r="8" />
              </svg>
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <rect x="6" y="6" width="8" height="8" />
              </svg>
              Stop Recording
            </button>
          )}
        </div>

        {/* Recording Status */}
        {recordingState.isRecording && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              Recording in progress...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
