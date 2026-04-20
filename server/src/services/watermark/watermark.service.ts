import sharp from "sharp";
import { WatermarkOptions } from "@photolab/shared/types";

export class WatermarkService {
  async applyWatermark(
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
    const actualPadding = Math.round(
      (padding * Math.min(width, height)) / 500,
    );

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
}

export const watermarkService = new WatermarkService();
