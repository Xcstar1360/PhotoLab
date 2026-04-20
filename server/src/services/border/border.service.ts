import sharp from "sharp";
import { BorderOptions } from "@photolab/shared/types";

export class BorderService {
  async applyBorder(
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
}

export const borderService = new BorderService();
