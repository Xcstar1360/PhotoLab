import sharp from "sharp";
import { CaptureOptions, ExifData } from "@photolab/shared/types";
import { escapeXml } from "../../utils/svg";

export class CaptureService {
  async applyCapture(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: CaptureOptions,
    exif: ExifData | null,
  ): Promise<sharp.Sharp> {
    const barHeight = options.height || 80;
    const textColor = options.textColor || "#ffffff";
    const bgColor = options.bgColor || "#000000";
    const style = options.style || "classic";

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

    const settingsText = settingsParts.join(" | ");

    const refWidth = 1920;
    const scale = width / refWidth;

    let svgText: string;

    if (style === "classic") {
      svgText = this.buildClassicStyle(refWidth, barHeight, cameraText, settingsText);
    } else if (style === "leica") {
      svgText = this.buildLeicaStyle(refWidth, barHeight, cameraText);
    } else if (style === "cinema") {
      svgText = this.buildCinemaStyle(refWidth, barHeight, cameraText, settingsText);
    } else {
      svgText = this.buildPolaroidStyle(refWidth, barHeight, cameraText, settingsText);
    }

    const svgBuffer = Buffer.from(svgText);
    let pngBuffer = await sharp(svgBuffer).png().toBuffer();

    const scaledBarHeight = Math.round(barHeight * scale);
    if (scale !== 1) {
      pngBuffer = await sharp(pngBuffer)
        .resize(width, scaledBarHeight)
        .toBuffer();
    }

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

  private buildClassicStyle(
    refWidth: number,
    barHeight: number,
    cameraText: string,
    settingsText: string,
  ): string {
    return `
      <svg width="${refWidth}" height="${barHeight}">
        <style>
          .camera-text {
            fill: #ffffff;
            font-size: 22px;
            font-family: "Helvetica Neue", Arial, sans-serif;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
          .camera-text-shadow {
            fill: #000000;
            font-size: 22px;
            font-family: "Helvetica Neue", Arial, sans-serif;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
          .settings-text {
            fill: #ffffff;
            font-size: 22px;
            font-family: "Helvetica Neue", Arial, sans-serif;
            font-weight: 400;
          }
          .settings-text-shadow {
            fill: #000000;
            font-size: 22px;
            font-family: "Helvetica Neue", Arial, sans-serif;
            font-weight: 400;
          }
        </style>
        <text class="camera-text-shadow" x="22" y="${barHeight - 14}" opacity="0.3">${escapeXml(cameraText)}</text>
        <text class="camera-text" x="20" y="${barHeight - 16}">${escapeXml(cameraText)}</text>
        <text class="settings-text-shadow" x="${refWidth - 18}" y="${barHeight - 14}" text-anchor="end" opacity="0.3">${escapeXml(settingsText)}</text>
        <text class="settings-text" x="${refWidth - 20}" y="${barHeight - 16}" text-anchor="end">${escapeXml(settingsText)}</text>
      </svg>
    `;
  }

  private buildLeicaStyle(
    refWidth: number,
    barHeight: number,
    cameraText: string,
  ): string {
    return `
      <svg width="${refWidth}" height="${barHeight}">
        <style>
          .leica-text {
            fill: rgba(255,255,255,0.9);
            font-size: 22px;
            font-family: "Helvetica Neue", sans-serif;
            font-weight: 300;
            letter-spacing: 1px;
          }
        </style>
        <text class="leica-text" x="20" y="${barHeight - 18}">${escapeXml(cameraText)}</text>
      </svg>
    `;
  }

  private buildCinemaStyle(
    refWidth: number,
    barHeight: number,
    cameraText: string,
    settingsText: string,
  ): string {
    const midY = barHeight / 2;
    return `
      <svg width="${refWidth}" height="${barHeight}">
        <rect x="0" y="0" width="${refWidth}" height="${barHeight}" fill="#000000"/>
        <style>
          .cinema-text {
            fill: #ffffff;
            font-size: 20px;
            font-family: "SF Mono", "Menlo", monospace;
            font-weight: 400;
          }
        </style>
        <text class="cinema-text" x="30" y="${midY + 6}">${escapeXml(settingsText)}</text>
        <text class="cinema-text" x="${refWidth - 30}" y="${midY + 6}" text-anchor="end">${escapeXml(cameraText)}</text>
      </svg>
    `;
  }

  private buildPolaroidStyle(
    refWidth: number,
    barHeight: number,
    cameraText: string,
    settingsText: string,
  ): string {
    const innerPadding = 16;
    return `
      <svg width="${refWidth}" height="${barHeight}">
        <rect x="0" y="0" width="${refWidth}" height="${barHeight}" fill="#f5f5f5"/>
        <rect x="${innerPadding}" y="${innerPadding}" width="${refWidth - innerPadding * 2}" height="${barHeight - innerPadding * 2}" fill="none" stroke="#333" stroke-width="1"/>
        <style>
          .polaroid-camera {
            fill: #1a1a1a;
            font-size: 24px;
            font-family: "Courier New", monospace;
            font-weight: bold;
          }
          .polaroid-date {
            fill: #666;
            font-size: 14px;
            font-family: "Courier New", monospace;
          }
        </style>
        <text class="polaroid-camera" x="${refWidth / 2}" y="${barHeight / 2 + 6}" text-anchor="middle">${escapeXml(cameraText)}</text>
        <text class="polaroid-date" x="${refWidth / 2}" y="${barHeight / 2 + 32}" text-anchor="middle">${escapeXml(settingsText)}</text>
      </svg>
    `;
  }

}

export const captureService = new CaptureService();
