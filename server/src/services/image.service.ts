import sharp from "sharp";
import path from "path";
import { ExifService } from "./exif.service";
import {
  WatermarkOptions,
  BorderOptions,
  PhotoInfoOptions,
  ProcessingOptions,
  ProcessingResult,
  ExifData,
} from "@photolab/shared/types";

export class ImageService {
  private exifService = new ExifService();
  private outputDir = path.join(process.cwd(), "uploads");

  async processImage(
    inputPath: string,
    options: ProcessingOptions,
  ): Promise<ProcessingResult> {
    try {
      const fileName = `processed_${Date.now()}.jpg`;
      const outputPath = path.join(this.outputDir, fileName);

      let image = sharp(inputPath);
      const metadata = await image.metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;

      // Extract EXIF first for use in photoInfo
      const exif = await this.exifService.extractExif(inputPath);

      if (options.border) {
        image = await this.applyBorder(image, width, height, options.border);
      }

      if (options.watermark && options.watermark.text) {
        image = await this.applyWatermark(
          image,
          width,
          height,
          options.watermark,
        );
      }

      if (options.photoInfo && options.photoInfo.enabled) {
        image = await this.applyPhotoInfo(
          image,
          width,
          height,
          options.photoInfo,
          exif,
        );
      }

      await image.jpeg({ quality: 90 }).toFile(outputPath);

      const result: ProcessingResult = {
        success: true,
        outputPath: `/uploads/${fileName}`,
        exif: {
          imageWidth: metadata.width,
          imageHeight: metadata.height,
        },
      };
      if (exif) {
        result.exif = {
          ...exif,
          imageWidth: metadata.width,
          imageHeight: metadata.height,
        };
      }

      return result;
    } catch (error) {
      console.error("Image processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async applyWatermark(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: WatermarkOptions,
  ): Promise<sharp.Sharp> {
    const fontSize = options.fontSize || 24;
    const color = options.color || "#ffffff";
    const opacity = options.opacity || 0.8;
    const padding = 20;

    const svgWidth = width;
    const svgHeight = height;
    const actualFontSize = Math.round(
      (fontSize * Math.min(width, height)) / 500,
    );
    const actualPadding = Math.round((padding * Math.min(width, height)) / 500);

    const svgText = `
      <svg width="${svgWidth}" height="${svgHeight}">
        <style>
          .watermark {
            fill: ${color};
            fill-opacity: ${opacity};
            font-size: ${actualFontSize}px;
            font-family: Arial, sans-serif;
            font-weight: bold;
          }
        </style>
        <text
          class="watermark"
          x="${this.getXPosition(svgWidth, actualFontSize, actualPadding, options.position)}"
          y="${this.getYPosition(svgHeight, actualFontSize, actualPadding, options.position)}"
          text-anchor="${this.getTextAnchor(options.position)}"
        >${this.escapeXml(options.text)}</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgText);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();

    return image.composite([
      {
        input: pngBuffer,
        top: 0,
        left: 0,
      },
    ]);
  }

  private getXPosition(
    width: number,
    fontSize: number,
    padding: number,
    position: string,
  ): number {
    switch (position) {
      case "bottom-right":
      case "top-right":
        return width - padding;
      case "bottom-left":
      case "top-left":
        return padding;
      case "center":
        return width / 2;
      default:
        return width - padding;
    }
  }

  private getYPosition(
    height: number,
    fontSize: number,
    padding: number,
    position: string,
  ): number {
    switch (position) {
      case "bottom-right":
      case "bottom-left":
        return height - padding;
      case "top-right":
      case "top-left":
        return fontSize + padding;
      case "center":
        return height / 2;
      default:
        return height - padding;
    }
  }

  private getTextAnchor(position: string): string {
    switch (position) {
      case "bottom-right":
      case "top-right":
        return "end";
      case "bottom-left":
      case "top-left":
        return "start";
      case "center":
        return "middle";
      default:
        return "end";
    }
  }

  private escapeXml(text: string): string {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
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

  private async applyBorder(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: BorderOptions,
  ): Promise<sharp.Sharp> {
    if (options.type === "blur") {
      return this.applyBlurBorder(image, width, height, options);
    } else {
      return this.applyColorBarBorder(image, width, height, options);
    }
  }

  private async applyColorBarBorder(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: BorderOptions,
  ): Promise<sharp.Sharp> {
    const barWidth = options.barWidth || 60;
    const color = options.color || "#1a1a1a";

    const svg = `
      <svg width="${width}" height="${height}">
        <rect x="0" y="0" width="${width}" height="${barWidth}" fill="${color}" />
        <rect x="0" y="${height - barWidth}" width="${width}" height="${barWidth}" fill="${color}" />
      </svg>
    `;

    const svgBuffer = Buffer.from(svg);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();

    return image.composite([
      {
        input: pngBuffer,
        top: 0,
        left: 0,
      },
    ]);
  }

  private async applyBlurBorder(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: BorderOptions,
  ): Promise<sharp.Sharp> {
    const blurRadius = options.blurRadius || 20;
    const barWidth = options.barWidth || 60;

    const blurred = await image.clone().blur(blurRadius).toBuffer();

    const topBottom = await sharp(blurred)
      .extract({
        left: 0,
        top: 0,
        width: width,
        height: barWidth,
      })
      .toBuffer();

    const bottomBottom = await sharp(blurred)
      .extract({
        left: 0,
        top: height - barWidth,
        width: width,
        height: barWidth,
      })
      .toBuffer();

    return image.composite([
      { input: topBottom, top: 0, left: 0 },
      { input: bottomBottom, top: height - barWidth, left: 0 },
    ]);
  }

  private async applyPhotoInfo(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: PhotoInfoOptions,
    exif: ExifData | null,
  ): Promise<sharp.Sharp> {
    const barHeight = options.height || 80;
    const textColor = options.textColor || "#333333";
    const bgColor = options.bgColor || "#FFFFFF";

    // Build info text from EXIF - organize into two lines
    let cameraText = "";
    const settingsParts: string[] = [];

    if (exif?.camera) {
      cameraText = `${exif.camera.make || ""} ${exif.camera.model || ""}`.trim();
    }

    if (exif?.settings) {
      const s = exif.settings;
      if (s.focalLength) settingsParts.push(`${s.focalLength}mm`);
      if (s.aperture) settingsParts.push(`f/${s.aperture}`);
      if (s.shutterSpeed) settingsParts.push(`${s.shutterSpeed}`);
      if (s.iso) settingsParts.push(`ISO ${s.iso}`);
    }

    if (exif?.timestamp) {
      const date = new Date(exif.timestamp)
        .toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, ".");
      settingsParts.push(date);
    }

    const settingsText = settingsParts.join("  ");

    // Use a fixed reference width for the SVG so font size is consistent
    // regardless of original image dimensions
    const refWidth = 1920;
    const fontSize = 32;
    const smallFontSize = 24;
    const scale = width / refWidth;

    // Create SVG with two-line layout
    const svgText = `
      <svg width="${refWidth}" height="${barHeight}">
        <rect x="0" y="0" width="${refWidth}" height="${barHeight}" fill="${bgColor}"/>
        <style>
          .camera-text {
            fill: ${textColor};
            font-size: ${fontSize}px;
            font-family: sans-serif;
            font-weight: 600;
          }
          .settings-text {
            fill: ${textColor};
            font-size: ${smallFontSize}px;
            font-family: sans-serif;
            font-weight: 400;
            opacity: 0.8;
          }
        </style>
        <text class="camera-text" x="30" y="${barHeight / 2 + fontSize * 0.4}">${this.escapeXml(cameraText)}</text>
        <text class="settings-text" x="${refWidth - 30}" y="${barHeight / 2 + smallFontSize * 0.4}" text-anchor="end">${this.escapeXml(settingsText)}</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgText);
    let pngBuffer = await sharp(svgBuffer).png().toBuffer();

    // Scale the text bar to match the original image width
    const scaledBarHeight = Math.round(barHeight * scale);
    if (scale !== 1) {
      pngBuffer = await sharp(pngBuffer)
        .resize(width, scaledBarHeight)
        .toBuffer();
    }

    // Extend canvas at the bottom and composite the text bar
    return image
      .extend({
        top: 0,
        bottom: scaledBarHeight,
        left: 0,
        right: 0,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .composite([
        {
          input: pngBuffer,
          top: height,
          left: 0,
        },
      ]);
  }
}

export const imageService = new ImageService();
