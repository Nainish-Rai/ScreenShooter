"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  RecordingState,
  ExportConfig,
  ZoomEvent,
  TimelineState,
} from "@/types/recording";
import { PreviewContainer } from "./PreviewContainer";
import { RecordingControls } from "./RecordingControls";
import { ExportDialog } from "./ExportDialog";
import { TimelineEditor } from "./TimelineEditor";
import { randomUUID } from "crypto";

// Add TextOverlay type
interface TextOverlay {
  text: string;
  x: number;
  y: number;
}

export default function ScreenRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    stream: null,
    mediaRecorder: null,
  });

  const [zoom, setZoom] = useState<number>(1);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [isTemporaryZoom, setIsTemporaryZoom] = useState(false);
  const temporaryZoomTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | undefined>();
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const [timelineState, setTimelineState] = useState<TimelineState>({
    recordedBlob: null,
    duration: 0,
    zoomEvents: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const lastZoomEvent = useRef<ZoomEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add textOverlay state
  const [textOverlay, setTextOverlay] = useState<TextOverlay | undefined>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCursorPos({ x, y });

        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        if (
          cursorX >= 0 &&
          cursorX <= rect.width &&
          cursorY >= 0 &&
          cursorY <= rect.height
        ) {
          setCursor({
            x: cursorX,
            y: cursorY,
            visible: true,
          });
        } else {
          setCursor((prev) => ({ ...prev, visible: false }));
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Add click handler for temporary zoom
  const handleTemporaryZoom = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current && recordingState.isRecording) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setCursorPos({ x, y });
        setIsTemporaryZoom(true);
        setZoom(2); // Set temporary zoom level

        const newZoomEvent: ZoomEvent = {
          id: randomUUID(),
          startTime: recordingState.duration,
          duration: 1, // 1 second default
          zoomLevel: 2,
          cursorPosition: { x, y },
        };

        setTimelineState((prev) => ({
          ...prev,
          zoomEvents: [...prev.zoomEvents, newZoomEvent],
        }));
        lastZoomEvent.current = newZoomEvent;

        // Clear existing timeout if any
        if (temporaryZoomTimeout.current) {
          clearTimeout(temporaryZoomTimeout.current);
        }

        // Reset zoom after 1 second
        temporaryZoomTimeout.current = setTimeout(() => {
          setIsTemporaryZoom(false);
          setZoom(1);
        }, 1000);
      }
    },
    [recordingState.isRecording, recordingState.duration]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("click", handleTemporaryZoom);
      return () => {
        container.removeEventListener("click", handleTemporaryZoom);
        if (temporaryZoomTimeout.current) {
          clearTimeout(temporaryZoomTimeout.current);
        }
      };
    }
  }, [handleTemporaryZoom]);

  // Add keyboard handler for temporary zoom
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        recordingState.isRecording &&
        (e.code === "KeyZ" || e.code === "Space")
      ) {
        e.preventDefault(); // Prevent page scroll on space
        if (!isTemporaryZoom) {
          setIsTemporaryZoom(true);
          setZoom(2);
        }
      }
    },
    [recordingState.isRecording, isTemporaryZoom]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "KeyZ" || e.code === "Space") {
      e.preventDefault();
      setIsTemporaryZoom(false);
      setZoom(1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Add duration tracking effect
  useEffect(() => {
    if (recordingState.isRecording && !recordingState.isPaused) {
      durationInterval.current = setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [recordingState.isRecording, recordingState.isPaused]);

  // Add new function to reset states
  const resetStates = useCallback(() => {
    mediaChunks.current = [];
    setTimelineState({
      recordedBlob: null,
      duration: 0,
      zoomEvents: [],
    });
    setTextOverlay(undefined);
    setIsEditing(false);
  }, []);

  // Modify startRecording to clear previous recording data
  const startRecording = async () => {
    try {
      resetStates(); // Add this line at the start

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunks.current.push(event.data);
        }
      };

      // mediaRecorder.onstop = () => {
      //   const tracks = stream.getTracks();
      //   tracks.forEach((track) => track.stop());
      //   if (videoRef.current) {
      //     videoRef.current.srcObject = null;
      //   }
      //   // setShowExportDialog(true);
      // };

      setRecordingState((prev) => ({
        ...prev,
        stream,
        mediaRecorder,
        isRecording: true,
        duration: 0,
        isPaused: false,
      }));

      mediaRecorder.start();

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

  // Add pause/resume functionality
  const togglePause = useCallback(() => {
    if (!recordingState.mediaRecorder) return;

    if (recordingState.isPaused) {
      recordingState.mediaRecorder.resume();
      setRecordingState((prev) => ({ ...prev, isPaused: false }));
    } else {
      recordingState.mediaRecorder.pause();
      setRecordingState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [recordingState.mediaRecorder, recordingState.isPaused]);

  // Modify stopRecording to properly handle chunks
  const stopRecording = useCallback(async () => {
    if (recordingState.mediaRecorder && recordingState.stream) {
      recordingState.mediaRecorder.stop();
      recordingState.stream.getTracks().forEach((track) => track.stop());

      // Wait for the last chunk to be added
      await new Promise((resolve) => {
        if (recordingState.mediaRecorder) {
          recordingState.mediaRecorder.addEventListener("stop", resolve, {
            once: true,
          });
        }
      });

      setIsProcessing(true);
      const finalBlob = new Blob(mediaChunks.current, { type: "video/webm" });

      try {
        const formData = new FormData();
        formData.append("video", finalBlob);
        formData.append("format", "mp4");
        formData.append("quality", "high");

        const response = await fetch("/api/process-video", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Processing failed");

        const processedBlob = await response.blob();
        setTimelineState((prev) => ({
          ...prev,
          recordedBlob: processedBlob,
          duration: recordingState.duration,
        }));

        setRecordingState({
          isRecording: false,
          isPaused: false,
          duration: 0,
          stream: null,
          mediaRecorder: null,
        });

        setIsEditing(true);
      } catch (error) {
        console.error("Error processing video:", error);
        alert("Failed to process video. Please try again.");
        resetStates();
      } finally {
        setIsProcessing(false);
      }
    }
  }, [
    recordingState.mediaRecorder,
    recordingState.stream,
    recordingState.duration,
    resetStates,
  ]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (recordingState.stream) {
        recordingState.stream.getTracks().forEach((track) => track.stop());
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (temporaryZoomTimeout.current) {
        clearTimeout(temporaryZoomTimeout.current);
      }
    };
  }, [recordingState.stream]);

  // Download recording
  // const downloadRecording = async (blob: Blob) => {
  //   setShowExportDialog(true);
  // };

  // Update handleExport to include text overlay
  const handleExport = async (config: ExportConfig) => {
    const formData = new FormData();
    formData.append(
      "video",
      new Blob(mediaChunks.current, { type: "video/webm" })
    );
    formData.append("format", config.format);
    formData.append("quality", config.quality);

    // Add text overlay data if available
    if (textOverlay) {
      formData.append("textOverlay", JSON.stringify(textOverlay));
    }

    try {
      const response = await fetch("/api/process-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `screen-recording.${config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setShowExportDialog(false);
      setExportProgress(undefined);
    }
  };

  // Add handlers for timeline editing
  const handleUpdateZoomEvent = (updatedEvent: ZoomEvent) => {
    setTimelineState((prev) => ({
      ...prev,
      zoomEvents: prev.zoomEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    }));
  };

  const handleDeleteZoomEvent = (eventId: string) => {
    setTimelineState((prev) => ({
      ...prev,
      zoomEvents: prev.zoomEvents.filter((event) => event.id !== eventId),
    }));
  };

  // Update the TimelineEditor handler
  const handleTimelineExport = (overlay?: TextOverlay) => {
    setTextOverlay(overlay);
    setShowExportDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {isProcessing ? (
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Processing video...</p>
          </div>
        ) : !isEditing ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Screen Recorder
            </h1>

            <PreviewContainer
              ref={containerRef}
              videoRef={videoRef as React.RefObject<HTMLVideoElement>}
              cursor={cursor}
              cursorPos={cursorPos}
              zoom={zoom}
              isTemporaryZoom={isTemporaryZoom}
              recordingState={recordingState}
            />

            <RecordingControls
              isRecording={recordingState.isRecording}
              isPaused={recordingState.isPaused}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onTogglePause={togglePause}
              zoom={zoom}
              onZoomIn={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
              onZoomOut={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
              onResetZoom={() => setZoom(1)}
              duration={0}
            />

            {recordingState.isRecording && (
              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                  Recording in progress...
                </span>
              </div>
            )}
          </>
        ) : (
          <TimelineEditor
            timelineState={timelineState}
            onUpdateZoomEvent={handleUpdateZoomEvent}
            onDeleteZoomEvent={handleDeleteZoomEvent}
            onExport={handleTimelineExport}
          />
        )}

        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          onExport={handleExport}
          progress={exportProgress}
          timelineState={timelineState}
          textOverlay={textOverlay}
        />
      </div>
    </div>
  );
}
