import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { imageService } from '../services/image.service';
import { exifService } from '../services/exif.service';
import { ProcessingOptions } from '@photolab/shared/types';

const router = Router();

type MulterFile = Express.Multer.File;

interface MulterRequest extends Request {
  file?: MulterFile;
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `upload_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/upload', upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const exif = await exifService.extractExif(filePath);

    res.json({
      success: true,
      filePath: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      exif
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/process', upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const options: ProcessingOptions = {
      watermark: req.body.watermark ? JSON.parse(req.body.watermark) : undefined,
      border: req.body.border ? JSON.parse(req.body.border) : undefined
    };

    const result = await imageService.processImage(req.file.path, options);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

router.get('/exif/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const exif = await exifService.extractExif(filePath);
    res.json(exif);
  } catch (error) {
    console.error('EXIF extraction error:', error);
    res.status(500).json({ error: 'EXIF extraction failed' });
  }
});

router.get('/color/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const color = await imageService.extractDominantColor(filePath);
    res.json({ dominantColor: color });
  } catch (error) {
    console.error('Color extraction error:', error);
    res.status(500).json({ error: 'Color extraction failed' });
  }
});

export default router;
