<script setup lang="ts">
import { ref } from 'vue'
import DropZone from '../components/DropZone.vue'
import ImagePreview from '../components/ImagePreview.vue'
import WatermarkPanel from '../components/WatermarkPanel.vue'
import BorderPanel from '../components/BorderPanel.vue'
import ExifInfo from '../components/ExifInfo.vue'
import ActionButtons from '../components/ActionButtons.vue'
import { usePhotoApi } from '../composables/usePhotoApi'
import type { WatermarkOptions, BorderOptions, ExifData } from '@photolab/shared/types'

const { uploadPhoto, processPhoto, downloadResult } = usePhotoApi()

const uploadedFile = ref<File | null>(null)
const originalUrl = ref('')
const processedUrl = ref('')
const exif = ref<ExifData | null>(null)
const isProcessing = ref(false)
const showDownload = ref(false)

const watermark = ref<WatermarkOptions>({
  text: 'PhotoLab',
  position: 'bottom-right',
  fontSize: 24,
  color: '#ffffff',
  opacity: 0.8
})

const border = ref<BorderOptions>({
  type: 'color-bar',
  color: '#1a1a1a',
  barWidth: 60,
  dominantColor: false,
  blurRadius: 20
})

async function handleFileSelected(file: File) {
  uploadedFile.value = file
  const result = await uploadPhoto(file)
  if (result.success) {
    originalUrl.value = result.filePath
    exif.value = result.exif ?? null
    processedUrl.value = ''
    showDownload.value = false
  } else {
    alert('上传失败: ' + result.error)
  }
}

async function handleProcess() {
  if (!uploadedFile.value) {
    console.log('handleProcess: no uploadedFile')
    return
  }

  console.log('handleProcess: calling processPhoto with', {
    file: uploadedFile.value.name,
    watermark: watermark.value,
    border: border.value
  })

  isProcessing.value = true
  try {
    const result = await processPhoto(uploadedFile.value, watermark.value, border.value)
    console.log('handleProcess: result', result)
    if (result.success && result.outputPath) {
      processedUrl.value = result.outputPath
      showDownload.value = true
      if (result.exif) {
        exif.value = result.exif
      }
    } else {
      alert('处理失败: ' + result.error)
    }
  } catch (err) {
    console.error('handleProcess: error', err)
    alert('处理失败: ' + (err as Error).message)
  } finally {
    isProcessing.value = false
  }
}

function handleDownload() {
  if (processedUrl.value) {
    downloadResult(processedUrl.value)
  }
}
</script>

<template>
  <div class="container">
    <h1>PhotoLab</h1>

    <div class="card">
      <DropZone @file-selected="handleFileSelected" />
      <ImagePreview v-if="originalUrl" :original-url="originalUrl" :processed-url="processedUrl" />
    </div>

    <div class="card">
      <WatermarkPanel v-model="watermark" />
      <BorderPanel v-model="border" />
      <ActionButtons :is-processing="isProcessing" :show-download="showDownload" @process="handleProcess" @download="handleDownload" />
    </div>

    <div class="card" v-if="exif">
      <h3>拍摄设备信息</h3>
      <ExifInfo :exif="exif" />
    </div>
  </div>
</template>
