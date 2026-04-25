import sharp from "sharp";
import path from "path";
import {
  WatermarkOptions,
  WatermarkFreePosition,
  WatermarkTextOptions,
  WatermarkLogoOptions,
} from "@photolab/shared/types";

export class WatermarkService {
  async applyWatermark(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: WatermarkOptions,
  ): Promise<sharp.Sharp> {
    if (!options.enabled) {
      return image;
    }

    if (options.type === 'logo' && options.logoOptions) {
      return this.applyLogoWatermark(image, width, height, options);
    } else if (options.textOptions) {
      return this.applyTextWatermark(image, width, height, options);
    }

    return image;
  }

  private async applyTextWatermark(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: WatermarkOptions,
  ): Promise<sharp.Sharp> {
    const opts: WatermarkTextOptions = options.textOptions!;
    const fontSize = opts.fontSize || 24;
    const color = opts.color || "#ffffff";
    const opacity = opts.opacity ?? 0.8;
    const rotation = opts.rotation || 0;

    const { x, y } = this.calculatePosition(
      width, height,
      options.freePosition
    );

    const textAnchor = 'middle';
    const svgText = this.buildTextSVG({
      width,
      height,
      text: opts.text,
      fontSize,
      color,
      opacity,
      x,
      y,
      textAnchor,
      rotation,
      shadow: opts.shadow
    });

    const svgBuffer = Buffer.from(svgText);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();

    return image.composite([{ input: pngBuffer, top: 0, left: 0 }]);
  }

  private async applyLogoWatermark(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: WatermarkOptions,
  ): Promise<sharp.Sharp> {
    const opts: WatermarkLogoOptions = options.logoOptions!;

    if (!opts.logoUrl) {
      return image;
    }

    const logoPath = path.join(process.cwd(), opts.logoUrl.replace(/^\//, ''));
    const logoWidth = opts.width || 100;
    const opacity = opts.opacity ?? 0.8;
    const rotation = opts.rotation || 0;
    const padding = 20;

    let logoBuffer = await sharp(logoPath)
      .rotate(rotation !== 0 ? rotation : undefined)
      .resize(logoWidth, null, { fit: 'inside' })
      .ensureAlpha()
      .toBuffer();

    if (opacity < 1) {
      const metadata = await sharp(logoBuffer).metadata();
      const logoHeight = metadata.height || logoWidth;

      const overlayBuffer = await sharp({
        create: {
          width: metadata.width || logoWidth,
          height: logoHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: opacity }
        }
      }).toBuffer();

      logoBuffer = await sharp(logoBuffer)
        .composite([{ input: overlayBuffer, blend: 'over' }])
        .toBuffer();
    }

    const { x, y } = this.calculateLogoPosition(
      width, height, logoWidth,
      options.freePosition
    );

    return image.composite([{
      input: logoBuffer,
      top: Math.round(y),
      left: Math.round(x),
      blend: 'over'
    }]);
  }

  private buildTextSVG(params: {
    width: number;
    height: number;
    text: string;
    fontSize: number;
    color: string;
    opacity: number;
    x: number;
    y: number;
    textAnchor: string;
    rotation: number;
    shadow?: { offsetX: number; offsetY: number; blur: number; color: string };
  }): string {
    const { width, height, text, fontSize, color, opacity, x, y, textAnchor, rotation } = params;

    // 旋转使用 SVG transform 属性
    const transform = rotation ? `transform="rotate(${rotation} ${x} ${y})"` : '';

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .watermark {
            fill: ${color};
            fill-opacity: ${opacity};
            font-size: ${fontSize}px;
            font-family: Arial, sans-serif;
            font-weight: bold;
          }
        </style>
        <text
          class="watermark"
          x="${x}"
          y="${y}"
          text-anchor="${textAnchor}"
          dominant-baseline="middle"
          ${transform}
        >${this.escapeXml(text)}</text>
      </svg>
    `;
  }

  private calculatePosition(
    width: number,
    height: number,
    freePosition?: WatermarkFreePosition
  ): { x: number; y: number } {
    if (freePosition) {
      return {
        x: (width * freePosition.xPercent) / 100,
        y: (height * freePosition.yPercent) / 100
      };
    }
    // 默认位置：右下角
    return {
      x: width * 0.9,
      y: height * 0.9
    };
  }

  private calculateLogoPosition(
    width: number,
    height: number,
    logoWidth: number,
    freePosition?: WatermarkFreePosition
  ): { x: number; y: number } {
    if (freePosition) {
      return {
        x: (width * freePosition.xPercent) / 100 - logoWidth / 2,
        y: (height * freePosition.yPercent) / 100 - logoWidth / 2
      };
    }
    // 默认位置：右下角
    return {
      x: width - logoWidth - 20,
      y: height - logoWidth - 20
    };
  }

  private rgbaToHex(rgba: string): string {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return rgba;
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
