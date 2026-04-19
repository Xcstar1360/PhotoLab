<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import DropZone from '../components/DropZone.vue'
import ImagePreview from '../components/ImagePreview.vue'
import WatermarkPanel from '../components/WatermarkPanel.vue'
import BorderPanel from '../components/BorderPanel.vue'
import ExifInfo from '../components/ExifInfo.vue'
import ActionButtons from '../components/ActionButtons.vue'
import { usePhotoApi } from '../composables/usePhotoApi'
import type { WatermarkOptions, BorderOptions, ExifData } from '@photolab/shared/types'

const { uploadPhoto, processPhoto, downloadResult } = usePhotoApi()

const isDark = ref(true)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  }
  applyTheme()
})

watch(isDark, () => {
  applyTheme()
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

function applyTheme() {
  document.body.classList.toggle('light-theme', !isDark.value)
}

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
  <div class="app-layout">
    <header class="app-header">
      <div class="logo">
        <span class="logo-icon">◆</span>
        <span class="logo-text">PhotoLab</span>
      </div>
      <button class="theme-btn" @click="isDark = !isDark" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
        <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
      </button>
    </header>

    <main class="app-main">
      <!-- Left Panel: Parameters -->
      <aside class="panel panel-left">
        <div class="panel-header">
          <h2>参数设置</h2>
        </div>
        <div class="panel-content">
          <WatermarkPanel v-model="watermark" />
          <BorderPanel v-model="border" />
        </div>
        <div class="panel-footer">
          <ActionButtons :is-processing="isProcessing" :show-download="showDownload" @process="handleProcess" @download="handleDownload" />
        </div>
      </aside>

      <!-- Center Panel: Image Display -->
      <section class="panel panel-center">
        <div class="panel-header">
          <h2>图片预览</h2>
        </div>
        <div class="panel-content">
          <DropZone v-if="!originalUrl" @file-selected="handleFileSelected" />
          <ImagePreview v-else :original-url="originalUrl" :processed-url="processedUrl" @file-selected="handleFileSelected" />
        </div>
      </section>

      <!-- Right Panel: Capture Info -->
      <aside class="panel panel-right">
        <div class="panel-header">
          <h2>拍摄信息</h2>
        </div>
        <div class="panel-content">
          <ExifInfo :exif="exif" />
          <div v-if="!exif" class="empty-state">
            <div class="empty-icon">📷</div>
            <p>暂无拍摄信息</p>
            <p class="empty-hint">上传照片后自动解析</p>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>
