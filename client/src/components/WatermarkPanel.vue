<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ColorPicker from './ColorPicker.vue'
import type { WatermarkOptions, WatermarkPresetTemplate } from '@photolab/shared/types'

const templates: WatermarkPresetTemplate[] = [
  { id: 'copyright', name: '版权声明', text: '© {year} 作者名. All Rights Reserved.' },
  { id: 'social', name: '社交媒体', text: '@username' },
  { id: 'symbol', name: '仅符号', text: '©' },
  { id: 'custom', name: '自定义', text: '' }
]

const props = defineProps<{
  modelValue: WatermarkOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WatermarkOptions]
}>()

const currentYear = new Date().getFullYear()

function getDefaultOptions(): WatermarkOptions {
  return {
    enabled: false,
    type: 'text',
    positionMode: 'preset',
    presetPosition: 'bottom-right',
    freePosition: { xPercent: 90, yPercent: 90 },
    textOptions: {
      text: '© 2026 作者名',
      fontSize: 24,
      color: '#ffffff',
      opacity: 0.8,
      rotation: 0,
      shadow: { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.5)' }
    },
    logoOptions: {
      logoUrl: '',
      width: 100,
      opacity: 0.8,
      rotation: 0
    }
  }
}

const localOptions = ref<WatermarkOptions>(props.modelValue.enabled ? { ...props.modelValue } : getDefaultOptions())

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localOptions.value)) {
    localOptions.value = newVal.enabled ? { ...newVal } : getDefaultOptions()
  }
}, { deep: true })

watch(localOptions, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })

const shadowEnabled = ref(!!localOptions.value.textOptions?.shadow)

const selectedTemplateId = ref('')

function setEnabled(enabled: boolean) {
  if (enabled) {
    localOptions.value = { ...getDefaultOptions(), enabled: true }
    shadowEnabled.value = true
  } else {
    localOptions.value = { ...localOptions.value, enabled: false }
  }
}

function setType(type: 'text' | 'logo') {
  localOptions.value = { ...localOptions.value, type }
}

function applyTemplate() {
  const template = templates.find(t => t.id === selectedTemplateId.value)
  if (template && template.id !== 'custom') {
    const text = template.text.replace('{year}', String(currentYear))
    localOptions.value = {
      ...localOptions.value,
      textOptions: {
        ...localOptions.value.textOptions!,
        text
      }
    }
  }
}

function handleTemplateChange() {
  applyTemplate()
}


function toggleShadow() {
  shadowEnabled.value = !shadowEnabled.value
  if (shadowEnabled.value) {
    localOptions.value.textOptions!.shadow = { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.5)' }
  } else {
    localOptions.value.textOptions!.shadow = undefined
  }
}

const logoPreviewUrl = ref<string | null>(null)

async function handleLogoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('logo', file)

  try {
    const res = await fetch('/api/photo/upload-logo', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.success) {
      localOptions.value.logoOptions!.logoUrl = data.logoPath
      logoPreviewUrl.value = data.logoPath
    }
  } catch (err) {
    console.error('Logo upload failed:', err)
  }
}

function removeLogo() {
  localOptions.value.logoOptions!.logoUrl = ''
  logoPreviewUrl.value = null
}

const textOptions = computed({
  get: () => localOptions.value.textOptions!,
  set: (val) => { localOptions.value.textOptions = val }
})

const logoOptions = computed({
  get: () => localOptions.value.logoOptions!,
  set: (val) => { localOptions.value.logoOptions = val }
})

const textColor = computed({
  get: () => localOptions.value.textOptions?.color || '#ffffff',
  set: (val) => {
    if (localOptions.value.textOptions) {
      localOptions.value.textOptions.color = val
    }
  }
})

const shadowColor = computed({
  get: () => {
    const color = localOptions.value.textOptions?.shadow?.color
    if (!color) return '#000000'
    return color.startsWith('#') ? color : '#000000'
  },
  set: (val) => {
    if (localOptions.value.textOptions?.shadow) {
      localOptions.value.textOptions.shadow.color = val
    }
  }
})

// Slider progress calculations
const opacityProgress = computed(() => {
  const val = localOptions.value.textOptions?.opacity ?? 0.8
  return `${val * 100}%`
})

const rotationProgress = computed(() => {
  const val = localOptions.value.textOptions?.rotation ?? 0
  return `${(val / 360) * 100}%`
})

const logoOpacityProgress = computed(() => {
  const val = localOptions.value.logoOptions?.opacity ?? 0.8
  return `${val * 100}%`
})

const logoRotationProgress = computed(() => {
  const val = localOptions.value.logoOptions?.rotation ?? 0
  return `${(val / 360) * 100}%`
})
</script>

<template>
  <div class="option-group watermark-panel">
    <h3>水印设置</h3>

    <div class="option-row">
      <label class="toggle-label">
        <input
          type="checkbox"
          :checked="localOptions.enabled"
          @change="setEnabled(($event.target as HTMLInputElement).checked)"
        >
        <span>启用水印</span>
      </label>
    </div>

    <template v-if="localOptions.enabled">
      <div class="type-tabs">
        <button
          :class="{ active: localOptions.type === 'text' }"
          @click="setType('text')"
        >文字水印</button>
        <button
          :class="{ active: localOptions.type === 'logo' }"
          @click="setType('logo')"
        >Logo水印</button>
      </div>

      <template v-if="localOptions.type === 'text'">
        <div class="form-row">
          <label class="form-label" for="wm-template">模板</label>
          <select id="wm-template" v-model="selectedTemplateId" @change="handleTemplateChange">
            <option value="">自定义</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="option-row">
          <label for="wm-text">水印文字</label>
          <input
            id="wm-text"
            type="text"
            :value="textOptions.text"
            @input="textOptions.text = ($event.target as HTMLInputElement).value"
            placeholder="输入水印文字"
          >
        </div>

        <div class="position-section">
          <div class="free-position-display">
            <span>X: {{ (localOptions.freePosition?.xPercent ?? 90).toFixed(1) }}%</span>
            <span>Y: {{ (localOptions.freePosition?.yPercent ?? 90).toFixed(1) }}%</span>
            <small>在预览区拖动水印调整位置</small>
          </div>
        </div>

        <div class="option-row">
          <label for="wm-fontSize">字体大小</label>
          <input
            id="wm-fontSize"
            type="number"
            :value="textOptions.fontSize"
            @input="textOptions.fontSize = parseInt(($event.target as HTMLInputElement).value)"
            min="12"
            max="200"
          >
        </div>

        <div class="form-row">
          <label class="form-label">颜色</label>
          <ColorPicker v-model="textColor" />
        </div>

        <div class="form-row">
          <label class="form-label" for="wm-opacity">透明度</label>
          <div class="slider-container">
            <input
              id="wm-opacity"
              type="range"
              :value="textOptions.opacity ?? 0.8"
              @input="textOptions.opacity = parseFloat(($event.target as HTMLInputElement).value)"
              min="0"
              max="1"
              step="0.01"
              :style="{ '--range-progress': opacityProgress }"
            >
            <span class="slider-value">{{ Math.round((textOptions.opacity ?? 0.8) * 100) }}%</span>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label" for="wm-rotation">旋转</label>
          <div class="slider-container">
            <input
              id="wm-rotation"
              type="range"
              :value="textOptions.rotation ?? 0"
              @input="textOptions.rotation = parseInt(($event.target as HTMLInputElement).value)"
              min="0"
              max="360"
              step="5"
              :style="{ '--range-progress': rotationProgress }"
            >
            <span class="slider-value">{{ textOptions.rotation ?? 0 }}°</span>
          </div>
        </div>

        <div class="effect-section">
          <label class="toggle-label">
            <input type="checkbox" :checked="shadowEnabled" @change="toggleShadow">
            <span>阴影效果</span>
          </label>
          <div v-if="shadowEnabled && textOptions.shadow" class="effect-controls">
            <div class="effect-row">
              <label>X偏移</label>
              <input
                type="number"
                :value="textOptions.shadow.offsetX"
                @input="textOptions.shadow!.offsetX = parseInt(($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="effect-row">
              <label>Y偏移</label>
              <input
                type="number"
                :value="textOptions.shadow.offsetY"
                @input="textOptions.shadow!.offsetY = parseInt(($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="effect-row">
              <label>模糊</label>
              <input
                type="number"
                :value="textOptions.shadow.blur"
                @input="textOptions.shadow!.blur = parseInt(($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="effect-row">
              <label>颜色</label>
              <ColorPicker v-model="shadowColor" />
            </div>
          </div>
        </div>
      </template>

      <template v-if="localOptions.type === 'logo'">
        <div class="logo-upload">
          <div v-if="localOptions.logoOptions?.logoUrl" class="logo-preview">
            <img :src="localOptions.logoOptions.logoUrl" alt="Logo preview">
            <button class="btn-remove" @click="removeLogo">移除</button>
          </div>
          <label v-else class="upload-btn">
            <input type="file" accept="image/*" @change="handleLogoUpload">
            上传Logo
          </label>
        </div>

        <div class="position-section">
          <div class="free-position-display">
            <span>X: {{ (localOptions.freePosition?.xPercent ?? 90).toFixed(1) }}%</span>
            <span>Y: {{ (localOptions.freePosition?.yPercent ?? 90).toFixed(1) }}%</span>
            <small>在预览区拖动水印调整位置</small>
          </div>
        </div>

        <div class="option-row">
          <label for="wm-logoWidth">宽度 (px)</label>
          <input
            id="wm-logoWidth"
            type="number"
            :value="logoOptions.width ?? 100"
            @input="logoOptions.width = parseInt(($event.target as HTMLInputElement).value)"
            min="20"
            max="500"
          >
        </div>

        <div class="form-row">
          <label class="form-label" for="wm-logoOpacity">透明度</label>
          <div class="slider-container">
            <input
              id="wm-logoOpacity"
              type="range"
              :value="logoOptions.opacity ?? 0.8"
              @input="logoOptions.opacity = parseFloat(($event.target as HTMLInputElement).value)"
              min="0"
              max="1"
              step="0.05"
              :style="{ '--range-progress': logoOpacityProgress }"
            >
            <span class="slider-value">{{ Math.round((logoOptions.opacity ?? 0.8) * 100) }}%</span>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label" for="wm-logoRotation">旋转</label>
          <div class="slider-container">
            <input
              id="wm-logoRotation"
              type="range"
              :value="logoOptions.rotation ?? 0"
              @input="logoOptions.rotation = parseInt(($event.target as HTMLInputElement).value)"
              min="0"
              max="360"
              step="5"
              :style="{ '--range-progress': logoRotationProgress }"
            >
            <span class="slider-value">{{ logoOptions.rotation ?? 0 }}°</span>
          </div>
        </div>

        <div class="effect-section">
          <label class="toggle-label">
            <input
              type="checkbox"
              :checked="!!localOptions.logoOptions?.shadow"
              @change="localOptions.logoOptions!.shadow = localOptions.logoOptions!.shadow ? undefined : { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.5)' }"
            >
            <span>阴影效果</span>
          </label>
          <div v-if="localOptions.logoOptions?.shadow" class="effect-controls">
            <div class="effect-row">
              <label>X偏移</label>
              <input
                type="number"
                :value="localOptions.logoOptions.shadow.offsetX"
                @input="localOptions.logoOptions!.shadow!.offsetX = parseInt(($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="effect-row">
              <label>Y偏移</label>
              <input
                type="number"
                :value="localOptions.logoOptions.shadow.offsetY"
                @input="localOptions.logoOptions!.shadow!.offsetY = parseInt(($event.target as HTMLInputElement).value)"
              >
            </div>
            <div class="effect-row">
              <label>模糊</label>
              <input
                type="number"
                :value="localOptions.logoOptions.shadow.blur"
                @input="localOptions.logoOptions!.shadow!.blur = parseInt(($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.watermark-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Type tabs */
.type-tabs {
  display: flex;
  gap: 8px;
}

.type-tabs button {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-card-dark);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.type-tabs button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* Slider container */
.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.slider-value {
  min-width: 40px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
}

/* Position display */
.position-section {
  margin-bottom: 14px;
}

.free-position-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 10px 12px;
  background: var(--color-card-dark);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.free-position-display span {
  color: var(--color-text);
}

.free-position-display small {
  width: 100%;
  color: var(--color-text-muted);
  font-size: 11px;
  margin-top: 4px;
}

/* Toggle label */
.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text);
}

/* Effect section */
.effect-section {
  margin: 8px 0;
  padding: 12px;
  background: var(--color-card-dark);
  border-radius: var(--radius-sm);
}

.effect-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--color-text);
}

.effect-controls {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.effect-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.effect-row label {
  flex: 0 0 40px;
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.effect-row input {
  flex: 1;
  padding: 6px 10px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 12px;
}

/* Logo upload */
.logo-upload {
  margin-bottom: 14px;
}

.logo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.logo-preview img {
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: var(--color-card-dark);
  padding: 8px;
}

.btn-remove {
  padding: 6px 14px;
  background: rgba(255, 100, 100, 0.15);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: var(--radius-sm);
  color: #ff6464;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: rgba(255, 100, 100, 0.25);
}

.upload-btn {
  display: block;
  padding: 16px;
  background: var(--color-card-dark);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-sm);
  text-align: center;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.upload-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.upload-btn input {
  display: none;
}
</style>
