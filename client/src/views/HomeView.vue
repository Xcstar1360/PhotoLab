<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import DropZone from '../components/DropZone.vue'
import ImagePreview from '../components/ImagePreview.vue'
import WatermarkPanel from '../components/WatermarkPanel.vue'
import BorderPanel from '../components/BorderPanel.vue'
import PhotoInfoPanel from '../components/PhotoInfoPanel.vue'
import ExifInfo from '../components/ExifInfo.vue'
import ActionButtons from '../components/ActionButtons.vue'
import { usePhotoApi } from '../composables/usePhotoApi'
import type { WatermarkOptions, BorderOptions, CaptureOptions, ExifData } from '@photolab/shared/types'

const { uploadPhoto, processPhoto, processExistingPhoto, downloadResult } = usePhotoApi()

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

// 获取预览区图片的显示宽度
function getPreviewImageDisplayWidth(): number {
  const imgEl = document.querySelector('.preview-image-wrap img') as HTMLImageElement
  if (imgEl) {
    return imgEl.getBoundingClientRect().width
  }
  return 0
}

// 获取预览区图片的原图宽度
function getPreviewImageNaturalWidth(): number {
  const imgEl = document.querySelector('.preview-image-wrap img') as HTMLImageElement
  if (imgEl) {
    return imgEl.naturalWidth
  }
  return 0
}

// 转换 watermark 选项，将预览区字体大小转换为原图尺寸的等效值
function convertWatermarkForBackend(wm: WatermarkOptions): WatermarkOptions {
  if (!wm.enabled) return wm

  const displayWidth = getPreviewImageDisplayWidth()
  const naturalWidth = getPreviewImageNaturalWidth()
  if (displayWidth <= 0 || naturalWidth <= 0) return wm

  const scaleRatio = naturalWidth / displayWidth
  if (scaleRatio === 1) return wm

  if (wm.type === 'text' && wm.textOptions) {
    return {
      ...wm,
      textOptions: {
        ...wm.textOptions,
        fontSize: Math.round((wm.textOptions.fontSize || 24) * scaleRatio)
      }
    }
  }

  if (wm.type === 'logo' && wm.logoOptions) {
    return {
      ...wm,
      logoOptions: {
        ...wm.logoOptions,
        width: Math.round((wm.logoOptions.width || 100) * scaleRatio)
      }
    }
  }

  return wm
}

const watermark = ref<WatermarkOptions>({
  enabled: false,
  type: 'text',
  positionMode: 'preset',
  presetPosition: 'bottom-right',
  freePosition: { xPercent: 90, yPercent: 90 },
  textOptions: {
    text: 'PhotoLab',
    fontSize: 24,
    color: '#ffffff',
    opacity: 0.8
  }
})

const border = ref<BorderOptions>({
  type: 'color-bar',
  color: '#1a1a1a',
  barWidth: 60,
  dominantColor: false,
  blurRadius: 20
})

const capture = ref<CaptureOptions>({
  enabled: false,
  style: 'classic',
  height: 80,
  textColor: '#333333',
  bgColor: '#FFFFFF'
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
    const watermarkForBackend = convertWatermarkForBackend(watermark.value)
    let result
    if (originalUrl.value) {
      result = await processExistingPhoto(originalUrl.value, watermarkForBackend, border.value, capture.value)
    } else {
      result = await processPhoto(uploadedFile.value, watermarkForBackend, border.value, capture.value)
    }
    console.log('handleProcess: result', result)
    if (result.success && result.outputPath) {
      processedUrl.value = result.outputPath + '?t=' + Date.now()
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

function handleWatermarkPositionChange(pos: { xPercent: number; yPercent: number }) {
  watermark.value.freePosition = pos
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
          <PhotoInfoPanel v-model="capture" />
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
          <ImagePreview v-else :original-url="originalUrl" :processed-url="processedUrl" :watermark-options="watermark" @file-selected="handleFileSelected" @watermark-position-change="handleWatermarkPositionChange" />
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

<style lang="scss" scoped>
// App Layout
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: rgba(13, 13, 20, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  color: var(--color-primary);
  text-shadow: var(--shadow-glow);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.theme-btn {
  width: 44px;
  height: 44px;
  background: var(--color-card-dark);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: var(--color-panel-hover);
    border-color: var(--color-primary);
    transform: scale(1.1);
    box-shadow: 0 0 20px var(--color-primary-glow);
  }
}

.theme-icon {
  font-size: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

.app-main {
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  gap: 20px;
  padding: 20px;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

// Panel Base
.panel {
  background: var(--color-panel);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.15);
  }
}

.panel-header {
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.2);

  h2 {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--color-text-muted);
  }
}

.panel-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.panel-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.15);
}

// Left Panel - Parameters
.panel-left .panel-header h2::before {
  content: '⚙ ';
}

// Center Panel - Preview
.panel-center {
  background: var(--color-card-dark);

  .panel-header {
    background: rgba(0, 212, 255, 0.05);
    border-bottom-color: rgba(0, 212, 255, 0.1);

    h2 {
      color: var(--color-primary);

      &::before {
        content: '◈ ';
      }
    }
  }
}

// Right Panel - Info
.panel-right .panel-header h2::before {
  content: 'ℹ ';
}

// Empty State
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.7;
}

// Responsive
@media (max-width: 1200px) {
  .app-main {
    grid-template-columns: 260px 1fr 240px;
    gap: 16px;
    padding: 16px;
  }
}

@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .panel-left {
    order: 2;
  }

  .panel-center {
    order: 1;
  }

  .panel-right {
    order: 3;
  }
}

// Light Theme Overrides
body.light-theme .app-header {
  background: rgba(255, 255, 255, 0.9);
  border-bottom-color: var(--color-border);
}

body.light-theme .theme-btn {
  background: var(--color-panel);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 102, 204, 0.2);
  }
}

body.light-theme .panel {
  box-shadow: var(--shadow-panel);
}
</style>
