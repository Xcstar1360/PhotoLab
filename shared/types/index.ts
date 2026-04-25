export interface ExifData {
  camera?: {
    make?: string;
    model?: string;
    lens?: string;
    serialNumber?: string;
  };
  settings?: {
    iso?: number;
    aperture?: number;
    shutterSpeed?: string;
    focalLength?: number;
    flash?: boolean;
  };
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  timestamp?: string;
  imageWidth?: number;
  imageHeight?: number;
  orientation?: number;
}

export interface WatermarkShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface WatermarkTextOptions {
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  shadow?: WatermarkShadow;
}

export interface WatermarkLogoOptions {
  logoUrl: string;
  width?: number;
  opacity?: number;
  rotation?: number;
  shadow?: WatermarkShadow;
}

export interface WatermarkFreePosition {
  xPercent: number;
  yPercent: number;
}

export type WatermarkPresetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';

export interface WatermarkOptions {
  enabled: boolean;
  type: 'text' | 'logo';
  positionMode: 'preset' | 'free';
  presetPosition?: WatermarkPresetPosition;
  freePosition?: WatermarkFreePosition;
  textOptions?: WatermarkTextOptions;
  logoOptions?: WatermarkLogoOptions;
}

export interface WatermarkPresetTemplate {
  id: string;
  name: string;
  text: string;
}

export interface BorderOptions {
  type: 'color-bar' | 'blur';
  color?: string;
  blurRadius?: number;
  barWidth?: number;
  dominantColor?: boolean;
}

export interface CaptureOptions {
  enabled: boolean;
  style: 'classic' | 'leica' | 'cinema' | 'polaroid';
  height?: number;
  textColor?: string;
  bgColor?: string;
}

export interface ProcessingOptions {
  watermark?: WatermarkOptions;
  border?: BorderOptions;
  capture?: CaptureOptions;
}

export interface ProcessingResult {
  success: boolean;
  outputPath?: string;
  exif?: ExifData;
  error?: string;
}
