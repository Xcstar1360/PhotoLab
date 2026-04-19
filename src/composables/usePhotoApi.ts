import type { WatermarkOptions, BorderOptions, ExifData, ProcessingResult } from '../types'

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
    const data: UploadResult = await res.json()
    return data
  }

  async function processPhoto(
    file: File,
    watermark: WatermarkOptions,
    border: BorderOptions
  ): Promise<ProcessingResult> {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('watermark', JSON.stringify(watermark))
    formData.append('border', JSON.stringify(border))

    const res = await fetch('/api/photo/process', { method: 'POST', body: formData })
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
    downloadResult
  }
}
