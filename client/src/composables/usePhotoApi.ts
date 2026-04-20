import type { WatermarkOptions, BorderOptions, PhotoInfoOptions, ExifData, ProcessingResult } from '@photolab/shared/types'

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
    border: BorderOptions,
    photoInfo?: PhotoInfoOptions
  ): Promise<ProcessingResult> {
    console.log('processPhoto: sending request', { fileName: file.name, watermark, border, photoInfo })
    const formData = new FormData()
    formData.append('image', file)
    formData.append('watermark', JSON.stringify(watermark))
    formData.append('border', JSON.stringify(border))
    if (photoInfo) {
      formData.append('photoInfo', JSON.stringify(photoInfo))
    }

    const res = await fetch('/api/photo/process', { method: 'POST', body: formData })
    console.log('processPhoto: response status', res.status)
    const data: ProcessingResult = await res.json()
    console.log('processPhoto: response data', data)
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
