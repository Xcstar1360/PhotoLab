<script setup lang="ts">
import type { PhotoInfoOptions } from '@photolab/shared/types'

const props = defineProps<{
  modelValue: PhotoInfoOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PhotoInfoOptions]
}>()

function toggleEnabled() {
  emit('update:modelValue', { ...props.modelValue, enabled: !props.modelValue.enabled })
}

function updateHeight(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  emit('update:modelValue', { ...props.modelValue, height: value })
}

function updateTextColor(e: Event) {
  emit('update:modelValue', { ...props.modelValue, textColor: (e.target as HTMLInputElement).value })
}

function updateBgColor(e: Event) {
  emit('update:modelValue', { ...props.modelValue, bgColor: (e.target as HTMLInputElement).value })
}
</script>

<template>
  <div class="option-group">
    <h3>拍摄参数</h3>
    <div class="option-row">
      <label>启用</label>
      <input type="checkbox" :checked="modelValue.enabled" @change="toggleEnabled">
    </div>
    <div class="option-row" v-if="modelValue.enabled">
      <label>风格</label>
      <select :value="modelValue.style">
        <option value="bottom-bar">底部横幅</option>
      </select>
    </div>
    <div class="option-row" v-if="modelValue.enabled">
      <label>高度</label>
      <input type="number" :value="modelValue.height || 80" @input="updateHeight" min="40" max="200">
      <span>px</span>
    </div>
    <div class="option-row" v-if="modelValue.enabled">
      <label>文字颜色</label>
      <input type="color" :value="modelValue.textColor || '#333333'" @input="updateTextColor">
    </div>
    <div class="option-row" v-if="modelValue.enabled">
      <label>背景色</label>
      <input type="color" :value="modelValue.bgColor || '#FFFFFF'" @input="updateBgColor">
    </div>
    <div class="preview-box" v-if="modelValue.enabled">
      <div class="preview-label">预览效果</div>
      <div class="preview-content">
        <div class="preview-image-placeholder">
          <div class="preview-text" :style="{ color: modelValue.textColor || '#333333', backgroundColor: modelValue.bgColor || '#FFFFFF' }">
            SONY ILCE-6700 | 50mm f/1.8 | 1/250s | ISO 400 | 2023:11:17
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.preview-box {
  margin-top: 16px;
  background: var(--color-card-dark);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.preview-label {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--color-border);
}

.preview-content {
  padding: 12px;
}

.preview-image-placeholder {
  height: 60px;
  background: #333;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-text {
  font-size: 10px;
  padding: 8px 16px;
  width: 100%;
  text-align: center;
  font-family: "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
