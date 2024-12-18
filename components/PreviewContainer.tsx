import { motion, AnimatePresence } from "framer-motion";
import { forwardRef } from "react";
import { RecordingState, CursorPosition } from "@/types/recording";

interface PreviewContainerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  cursor: CursorPosition;
  cursorPos: { x: number; y: number };
  zoom: number;
  isTemporaryZoom: boolean;
  recordingState: RecordingState;
}

export const PreviewContainer = forwardRef<
  HTMLDivElement,
  PreviewContainerProps
>(
  (
    { videoRef, cursor, cursorPos, zoom, isTemporaryZoom, recordingState },
    ref
  ) => {
    const zoomTransition = {
      type: "spring",
      stiffness: 300,
      damping: isTemporaryZoom ? 30 : 20,
    };

    return (
      <div
        ref={ref}
        className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 relative"
      >
        <motion.div
          className="w-full h-full"
          style={{ transformOrigin: `${cursorPos.x}% ${cursorPos.y}%` }}
          animate={{ scale: zoom, filter: "blur(0px)" }}
          transition={zoomTransition}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        </motion.div>

        <AnimatePresence>
          {cursor.visible && recordingState.isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute w-4 h-4 pointer-events-none"
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: "translate(-50%, -50%)",
                background: "rgba(255, 0, 0, 0.5)",
                border: "2px solid red",
                borderRadius: "50%",
                zIndex: 1000,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PreviewContainer.displayName = "PreviewContainer";
