import exifr from 'exifr';
import { ExifData } from '../types';

export class ExifService {
  async extractExif(imagePath: string): Promise<ExifData> {
    try {
      const exif = await exifr.parse(imagePath, {
        pick: [
          'Make', 'Model', 'LensModel', 'SerialNumber',
          'ISO', 'FNumber', 'ExposureTime', 'FocalLength', 'Flash',
          'GPSLatitude', 'GPSLongitude', 'GPSAltitude',
          'DateTimeOriginal', 'ImageWidth', 'ImageHeight', 'Orientation'
        ]
      });

      if (!exif) {
        return {};
      }

      const result: ExifData = {};

      if (exif.Make || exif.Model) {
        result.camera = {};
        if (exif.Make) result.camera.make = exif.Make;
        if (exif.Model) result.camera.model = exif.Model;
        if (exif.LensModel) result.camera.lens = exif.LensModel;
        if (exif.SerialNumber) result.camera.serialNumber = exif.SerialNumber;
      }

      if (exif.ISO || exif.FNumber || exif.ExposureTime || exif.FocalLength || exif.Flash !== undefined) {
        result.settings = {};
        if (exif.ISO) result.settings.iso = exif.ISO;
        if (exif.FNumber) result.settings.aperture = exif.FNumber;
        if (exif.ExposureTime) result.settings.shutterSpeed = this.formatShutterSpeed(exif.ExposureTime);
        if (exif.FocalLength) result.settings.focalLength = exif.FocalLength;
        if (exif.Flash !== undefined) result.settings.flash = exif.Flash;
      }

      if (exif.GPSLatitude || exif.GPSLongitude) {
        result.gps = {};
        if (exif.GPSLatitude) result.gps.latitude = exif.GPSLatitude;
        if (exif.GPSLongitude) result.gps.longitude = exif.GPSLongitude;
        if (exif.GPSAltitude) result.gps.altitude = exif.GPSAltitude;
      }

      if (exif.DateTimeOriginal) {
        result.timestamp = exif.DateTimeOriginal instanceof Date
          ? exif.DateTimeOriginal.toISOString()
          : String(exif.DateTimeOriginal);
      }

      if (exif.ImageWidth) result.imageWidth = exif.ImageWidth;
      if (exif.ImageHeight) result.imageHeight = exif.ImageHeight;
      if (exif.Orientation) result.orientation = exif.Orientation;

      return result;
    } catch (error) {
      console.error('EXIF extraction error:', error);
      return {};
    }
  }

  private formatShutterSpeed(exposureTime: number): string {
    if (exposureTime >= 1) {
      return `${exposureTime}s`;
    }
    const denominator = Math.round(1 / exposureTime);
    return `1/${denominator}s`;
  }
}

export const exifService = new ExifService();
