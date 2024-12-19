"use client";

import { useRef, useEffect, useState, SetStateAction } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ZoomEvent, TimelineState } from "@/types/recording";

interface TimelineEditorProps {
  timelineState: TimelineState;
  onUpdateZoomEvent: (event: ZoomEvent) => void;
  onDeleteZoomEvent: (eventId: string) => void;
  onExport: (textOverlay?: { text: string; x: number; y: number }) => void;
}

export function TimelineEditor({
  timelineState,
  onDeleteZoomEvent,
  onExport,
}: TimelineEditorProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 10, y: 10 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (timelineState.recordedBlob && videoRef.current) {
      videoRef.current.src = URL.createObjectURL(timelineState.recordedBlob);
    }
  }, [timelineState.recordedBlob]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = Math.min(
      percentage * timelineState.duration,
      timelineState.duration
    );

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTimelineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const drawFrame = () => {
        canvas.width = videoRef.current!.videoWidth;
        canvas.height = videoRef.current!.videoHeight;
        ctx.drawImage(videoRef.current!, 0, 0);

        if (overlayText) {
          ctx.font = "24px Arial";
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          ctx.lineWidth = 2;
          ctx.strokeText(overlayText, textPosition.x, textPosition.y);
          ctx.fillText(overlayText, textPosition.x, textPosition.y);
        }

        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    }
  }, [overlayText, textPosition]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          controls
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Text Overlay</div>
        <div className="flex space-x-4">
          <Input
            placeholder="Enter text overlay"
            value={overlayText}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setOverlayText(e.target.value)
            }
          />
          <Input
            type="number"
            placeholder="X position"
            value={textPosition.x}
            onChange={(e: { target: { value: string } }) =>
              setTextPosition((prev) => ({
                ...prev,
                x: parseInt(e.target.value) || 0,
              }))
            }
            className="w-24"
          />
          <Input
            type="number"
            placeholder="Y position"
            value={textPosition.y}
            onChange={(e: { target: { value: string } }) =>
              setTextPosition((prev) => ({
                ...prev,
                y: parseInt(e.target.value) || 0,
              }))
            }
            className="w-24"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Timeline</div>
        <div
          ref={timelineRef}
          className={`relative h-24 w-full bg-gray-100 rounded-lg p-2 overflow-hidden ${
            isDragging ? "bg-gray-200" : ""
          }`}
          onDragOver={handleTimelineDragOver}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleTimelineDrop}
        >
          {timelineState.zoomEvents.map((event) => (
            <div
              key={event.id}
              className="absolute bg-blue-200 rounded cursor-move"
              style={{
                left: `${Math.min(
                  (event.startTime / timelineState.duration) * 100,
                  100
                )}%`,
                width: `${Math.min(
                  (event.duration / timelineState.duration) * 100,
                  100 - (event.startTime / timelineState.duration) * 100
                )}%`,
                height: "20px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", event.id);
              }}
            >
              {event.zoomLevel}x
              <button
                className="absolute -top-2 -right-2 w-5 text-red-500"
                onClick={() => onDeleteZoomEvent(event.id)}
              >
                ×
              </button>
            </div>
          ))}
          <div
            className="absolute w-2 cursor-move bg-red-500 h-full top-0"
            style={{
              left: `${Math.min(
                (currentTime / timelineState.duration) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          onClick={() =>
            onExport({
              text: overlayText,
              x: textPosition.x,
              y: textPosition.y,
            })
          }
        >
          Export
        </Button>
      </div>
    </div>
  );
}
