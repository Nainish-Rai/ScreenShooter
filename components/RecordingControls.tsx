import { motion, AnimatePresence } from "framer-motion";

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function RecordingControls({
  isRecording,
  onStartRecording,
  onStopRecording,

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

      <div className="flex gap-4 justify-center">
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
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
