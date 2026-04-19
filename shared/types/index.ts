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

export interface WatermarkOptions {
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  fontSize?: number;
  color?: string;
  opacity?: number;
}

export interface BorderOptions {
  type: 'color-bar' | 'blur';
  color?: string;
  blurRadius?: number;
  barWidth?: number;
  dominantColor?: boolean;
}

export interface ProcessingOptions {
  watermark?: WatermarkOptions;
  border?: BorderOptions;
}

export interface ProcessingResult {
  success: boolean;
  outputPath?: string;
  exif?: ExifData;
  error?: string;
}
