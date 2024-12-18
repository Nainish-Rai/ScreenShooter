import { motion, AnimatePresence } from "framer-motion";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTogglePause: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export function RecordingControls({
  isRecording,
  isPaused,
  duration,
  onStartRecording,
  onStopRecording,
  onTogglePause,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: RecordingControlsProps) {
  return (
    <>
      <div className="flex gap-4 justify-center mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onZoomIn}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Zoom In (+)
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onResetZoom}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Reset Zoom
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onZoomOut}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Zoom Out (-)
        </motion.button>
      </div>

      <div className="flex gap-4 justify-center items-center">
        <AnimatePresence mode="wait">
          {!isRecording ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartRecording}
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
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onTogglePause}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
              >
                {isPaused ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isPaused ? "Resume" : "Pause"}
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStopRecording}
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
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {isRecording && (
        <div className="mt-4 text-center text-gray-600">
          <span className="font-mono">{formatDuration(duration)}</span>
          {isPaused && <span className="ml-2 text-yellow-500">(Paused)</span>}
        </div>
      )}
    </>
  );
}
