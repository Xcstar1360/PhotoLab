import type { WatermarkOptions, BorderOptions, CaptureOptions, ExifData, ProcessingResult } from '@photolab/shared/types'

export interface UploadResult {
  success: boolean
  filePath: string
  exif?: ExifData
  error?: string
}

export function usePhotoApi() {
  async function uploadPhoto(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch('/api/photo/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      return { success: false, filePath: '', error: `上传失败 (${res.status})` }
    }
    const data: UploadResult = await res.json()
    return data
  }

  async function processPhoto(
    file: File,
    watermark: WatermarkOptions,
    border: BorderOptions,
    capture?: CaptureOptions
  ): Promise<ProcessingResult> {
    console.log('processPhoto: sending request', { fileName: file.name, watermark, border, capture })
    const formData = new FormData()
    formData.append('image', file)
    formData.append('watermark', JSON.stringify(watermark))
    formData.append('border', JSON.stringify(border))
    if (capture) {
      formData.append('capture', JSON.stringify(capture))
    }

    const res = await fetch('/api/photo/process', { method: 'POST', body: formData })
    if (!res.ok) {
      return { success: false, outputPath: '', error: `处理失败 (${res.status})` }
    }
    const data: ProcessingResult = await res.json()
    return data
  }

  async function processExistingPhoto(
    originalPath: string,
    watermark: WatermarkOptions,
    border: BorderOptions,
    capture?: CaptureOptions
  ): Promise<ProcessingResult> {
    console.log('processExistingPhoto: sending request', { originalPath, watermark, border, capture })
    const res = await fetch('/api/photo/process-existing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalPath, watermark, border, capture })
    })
    if (!res.ok) {
      return { success: false, outputPath: '', error: `处理失败 (${res.status})` }
    }
    const data: ProcessingResult = await res.json()
    return data
  }

  function downloadResult(url: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = 'photolab_' + Date.now() + '.jpg'
    a.click()
  }

  return {
    uploadPhoto,
    processPhoto,
    processExistingPhoto,
    downloadResult
  }
}
