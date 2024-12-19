import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFileSync, promises as fsPromises } from "fs";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import { randomUUID } from "crypto";

const TEMP_DIR = join(process.cwd(), "temp");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File;
    const format = formData.get("format") as string;
    const quality = formData.get("quality") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Create unique filenames
    const inputFilename = `${randomUUID()}.webm`;
    const outputFilename = `${randomUUID()}.${format}`;
    const inputPath = join(TEMP_DIR, inputFilename);
    const outputPath = join(TEMP_DIR, outputFilename);

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    writeFile(inputPath, Buffer.from(bytes), (err) => {
      if (err) throw err;
    });

    const textOverlayStr = formData.get("textOverlay") as string;
    const textOverlay = textOverlayStr ? JSON.parse(textOverlayStr) : null;

    // Process video based on format and quality
    await new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      if (format === "gif") {
        command.fps(15).size("640x?").format("gif");
      } else {
        const qualityOptions = {
          high: { crf: "18", preset: "slow" },
          medium: { crf: "23", preset: "medium" },
          low: { crf: "28", preset: "fast" },
        };

        const qualitySettings =
          qualityOptions[quality as keyof typeof qualityOptions];

        if (textOverlay) {
          command = command.videoFilters(
            `drawtext=text='${textOverlay.text}':x=${textOverlay.x}:y=${textOverlay.y}:fontsize=24:fontcolor=white:borderw=2`
          );
        }

        command
          .videoCodec("libx264")
          .outputOptions([
            `-crf ${qualitySettings.crf}`,
            `-preset ${qualitySettings.preset}`,
          ])
          .format(format);
      }

      command.on("end", resolve).on("error", reject).save(outputPath);
    });

    // Read processed file
    const processedFile = readFileSync(outputPath);

    // Cleanup
    await Promise.all([
      fsPromises.unlink(inputPath),
      fsPromises.unlink(outputPath),
    ]);

    return new NextResponse(processedFile, {
      headers: {
        "Content-Type": `video/${format}`,
        "Content-Disposition": `attachment; filename="processed.${format}"`,
      },
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
