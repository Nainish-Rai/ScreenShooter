import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExportConfig } from "@/types/recording";
import { Progress } from "@/components/ui/progress";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  progress?: number;
}

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  progress,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportConfig["format"]>("mp4");
  const [quality, setQuality] = useState<ExportConfig["quality"]>("high");

  const handleExport = () => {
    onExport({ format, quality });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Recording</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <RadioGroup
                value={format}
                onValueChange={(v) => setFormat(v as ExportConfig["format"])}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mp4" id="mp4" />
                  <Label htmlFor="mp4">MP4</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="webm" id="webm" />
                  <Label htmlFor="webm">WebM</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gif" id="gif" />
                  <Label htmlFor="gif">GIF</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Quality</Label>
              <RadioGroup
                value={quality}
                onValueChange={(v) => setQuality(v as ExportConfig["quality"])}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {progress !== undefined && (
            <Progress value={progress} className="w-full" />
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Export</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
