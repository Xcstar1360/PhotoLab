import crypto from "crypto";
import sharp from "sharp";
import path from "path";
import { ExifService } from "./exif.service";
import { watermarkService } from "./watermark/watermark.service";
import { borderService } from "./border/border.service";
import { captureService } from "./capture/capture.service";
import { ProcessingOptions, ProcessingResult } from "@photolab/shared/types";

export class ImageService {
  private exifService = new ExifService();
  private outputDir = path.join(process.cwd(), "uploads");

  private async applyProcessing(
    image: sharp.Sharp,
    inputPath: string,
    outputPath: string,
    options: ProcessingOptions,
  ): Promise<ProcessingResult> {
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const exif = await this.exifService.extractExif(inputPath);

    if (options.border) {
      image = await borderService.applyBorder(
        image,
        width,
        height,
        options.border,
      );
    }

    if (options.watermark && options.watermark.enabled) {
      image = await watermarkService.applyWatermark(
        image,
        width,
        height,
        options.watermark,
      );
    }

    if (options.capture && options.capture.enabled) {
      image = await captureService.applyCapture(
        image,
        width,
        height,
        options.capture,
        exif,
      );
    }

    await image.jpeg({ quality: 90 }).toFile(outputPath);

    const result: ProcessingResult = {
      success: true,
      outputPath: `/uploads/${path.basename(outputPath)}`,
      exif: {
        ...exif,
        imageWidth: metadata.width,
        imageHeight: metadata.height,
      },
    };

    return result;
  }

  async processImage(
    inputPath: string,
    options: ProcessingOptions,
  ): Promise<ProcessingResult> {
    try {
      const fileName = `processed_${crypto.randomUUID()}.jpg`;
      const outputPath = path.join(this.outputDir, fileName);
      const image = sharp(inputPath);

      return this.applyProcessing(image, inputPath, outputPath, options);
    } catch (error) {
      console.error("Image processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async processExistingImage(
    inputPath: string,
    options: ProcessingOptions,
  ): Promise<ProcessingResult> {
    try {
      const hash = this.generateParamsHash(inputPath, options);
      const fileName = `processed_${hash}.jpg`;
      const outputPath = path.join(this.outputDir, fileName);
      const image = sharp(inputPath);

      return this.applyProcessing(image, inputPath, outputPath, options);
    } catch (error) {
      console.error("Image processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private generateParamsHash(inputPath: string, options: ProcessingOptions): string {
    const payload = JSON.stringify({ inputPath, options });
    return crypto.createHash("md5").update(payload).digest("hex").substring(0, 12);
  }

  async extractDominantColor(imagePath: string): Promise<string> {
    try {
      const { data, info } = await sharp(imagePath)
        .resize(100, 100, { fit: "inside" })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const buffer = data;
      let r = 0,
        g = 0,
        b = 0;
      const pixelCount = info.width * info.height;

      for (let i = 0; i < buffer.length; i += 3) {
        r += buffer[i];
        g += buffer[i + 1];
        b += buffer[i + 2];
      }

      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);

      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    } catch (error) {
      console.error("Color extraction error:", error);
      return "#333333";
    }
  }
}

export const imageService = new ImageService();
