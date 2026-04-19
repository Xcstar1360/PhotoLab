import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { ExifService } from './exif.service';
import { WatermarkOptions, BorderOptions, ProcessingOptions, ProcessingResult, ExifData } from '../types';

export class ImageService {
  private exifService = new ExifService();
  private outputDir = path.join(process.cwd(), 'uploads');

  async processImage(
    inputPath: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    try {
      const fileName = `processed_${Date.now()}.jpg`;
      const outputPath = path.join(this.outputDir, fileName);

      let image = sharp(inputPath);
      const metadata = await image.metadata();

      if (options.border) {
        image = await this.applyBorder(image, metadata.width || 0, metadata.height || 0, options.border);
      }

      if (options.watermark) {
        image = await this.applyWatermark(image, metadata.width || 0, metadata.height || 0, options.watermark);
      }

      await image.jpeg({ quality: 90 }).toFile(outputPath);

      const exif = await this.exifService.extractExif(inputPath);

      return {
        success: true,
        outputPath: `/uploads/${fileName}`,
        exif
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async applyWatermark(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: WatermarkOptions
  ): Promise<sharp.Sharp> {
    const fontSize = options.fontSize || 24;
    const color = options.color || '#ffffff';
    const opacity = options.opacity || 0.8;
    const padding = 20;

    const svgText = `
      <svg width="${width}" height="${height}">
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
          x="${this.getXPosition(width, fontSize, padding, options.position)}"
          y="${this.getYPosition(height, fontSize, padding, options.position)}"
          text-anchor="${this.getTextAnchor(options.position)}"
        >${this.escapeXml(options.text)}</text>
      </svg>
    `;

    return image.composite([{
      input: Buffer.from(svgText),
      top: 0,
      left: 0
    }]);
  }

  private getXPosition(width: number, fontSize: number, padding: number, position: string): number {
    switch (position) {
      case 'bottom-right':
      case 'top-right':
        return width - padding;
      case 'bottom-left':
      case 'top-left':
        return padding;
      case 'center':
        return width / 2;
      default:
        return width - padding;
    }
  }

  private getYPosition(height: number, fontSize: number, padding: number, position: string): number {
    switch (position) {
      case 'bottom-right':
      case 'bottom-left':
        return height - padding;
      case 'top-right':
      case 'top-left':
        return fontSize + padding;
      case 'center':
        return height / 2;
      default:
        return height - padding;
    }
  }

  private getTextAnchor(position: string): string {
    switch (position) {
      case 'bottom-right':
      case 'top-right':
        return 'end';
      case 'bottom-left':
      case 'top-left':
        return 'start';
      case 'center':
        return 'middle';
      default:
        return 'end';
    }
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async extractDominantColor(imagePath: string): Promise<string> {
    try {
      const { data, info } = await sharp(imagePath)
        .resize(100, 100, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const buffer = data;
      let r = 0, g = 0, b = 0;
      const pixelCount = info.width * info.height;

      for (let i = 0; i < buffer.length; i += 3) {
        r += buffer[i];
        g += buffer[i + 1];
        b += buffer[i + 2];
      }

      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (error) {
      console.error('Color extraction error:', error);
      return '#333333';
    }
  }

  private async applyBorder(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: BorderOptions
  ): Promise<sharp.Sharp> {
    if (options.type === 'blur') {
      return this.applyBlurBorder(image, width, height, options);
    } else {
      return this.applyColorBarBorder(image, width, height, options);
    }
  }

  private async applyColorBarBorder(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: BorderOptions
  ): Promise<sharp.Sharp> {
    const barWidth = options.barWidth || 60;
    const color = options.color || '#1a1a1a';

    const svg = `
      <svg width="${width}" height="${height}">
        <rect x="0" y="0" width="${width}" height="${barWidth}" fill="${color}" />
        <rect x="0" y="${height - barWidth}" width="${width}" height="${barWidth}" fill="${color}" />
      </svg>
    `;

    return image.composite([{
      input: Buffer.from(svg),
      top: 0,
      left: 0
    }]);
  }

  private async applyBlurBorder(
    image: sharp.Sharp,
    width: number,
    height: number,
    options: BorderOptions
  ): Promise<sharp.Sharp> {
    const blurRadius = options.blurRadius || 20;
    const barWidth = options.barWidth || 60;

    const blurred = await image.clone().blur(blurRadius).toBuffer();

    const topBottom = await sharp(blurred)
      .extract({
        left: 0,
        top: 0,
        width: width,
        height: barWidth
      })
      .toBuffer();

    const bottomBottom = await sharp(blurred)
      .extract({
        left: 0,
        top: height - barWidth,
        width: width,
        height: barWidth
      })
      .toBuffer();

    return image.composite([
      { input: topBottom, top: 0, left: 0 },
      { input: bottomBottom, top: height - barWidth, left: 0 }
    ]);
  }
}

export const imageService = new ImageService();
