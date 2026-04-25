<script setup lang="ts">
import ColorPicker from './ColorPicker.vue'
import type { CaptureOptions } from '@photolab/shared/types'

const props = defineProps<{
  modelValue: CaptureOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CaptureOptions]
}>()

function toggleEnabled() {
  emit('update:modelValue', { ...props.modelValue, enabled: !props.modelValue.enabled })
}

function selectStyle(style: CaptureOptions['style']) {
  emit('update:modelValue', { ...props.modelValue, style })
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

const styleOptions: { value: CaptureOptions['style']; label: string }[] = [
  { value: 'classic', label: '经典' },
  { value: 'leica', label: '徕卡' },
  { value: 'cinema', label: '影院' },
  { value: 'polaroid', label: '宝丽来' },
]
</script>

<template>
  <div class="option-group photo-info-group">
    <h3>拍摄参数</h3>

    <div class="form-row">
      <span class="form-label">启用</span>
      <button class="toggle-switch" :class="{ active: modelValue.enabled }" @click="toggleEnabled">
        <span class="toggle-knob"></span>
      </button>
    </div>

    <template v-if="modelValue.enabled">
      <div class="form-row">
        <span class="form-label">风格</span>
        <div class="style-list">
          <button
            v-for="opt in styleOptions"
            :key="opt.value"
            class="style-item"
            :class="{ selected: modelValue.style === opt.value }"
            @click="selectStyle(opt.value)"
          >
            <span class="style-dot"></span>
            <span class="style-name">{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <div class="form-row">
        <span class="form-label">高度</span>
        <div class="input-group">
          <input type="number" :value="modelValue.height || 80" @input="updateHeight" min="40" max="200">
          <span class="unit">px</span>
        </div>
      </div>

      <div class="form-row">
        <span class="form-label">文字</span>
        <ColorPicker :model-value="modelValue.textColor || '#333333'" @update:model-value="(v) => emit('update:modelValue', { ...modelValue, textColor: v })" />
      </div>

      <div class="form-row">
        <span class="form-label">背景</span>
        <ColorPicker :model-value="modelValue.bgColor || '#FFFFFF'" @update:model-value="(v) => emit('update:modelValue', { ...modelValue, bgColor: v })" />
      </div>

      <div class="preview-section">
        <div class="preview-header">预览效果</div>
        <div class="preview-area">
          <div class="preview-text" :style="{ color: modelValue.textColor || '#333333', backgroundColor: modelValue.bgColor || '#FFFFFF' }">
            <template v-if="modelValue.style === 'classic'">SONY ILCE-6700</template>
            <template v-else-if="modelValue.style === 'leica'">SONY ILCE-6700</template>
            <template v-else-if="modelValue.style === 'cinema'">50mm f/1.8  1/250s ISO 400</template>
            <template v-else>SONY ILCE-6700</template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.style-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.style-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--color-card-dark);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: var(--color-primary);
  }

  &.selected {
    border-color: var(--color-primary);
    background: rgba(0, 212, 255, 0.08);
  }
}

.style-name {
  font-size: 13px;
  color: var(--color-text);
}

.style-dot {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;

  .style-item.selected & {
    border-color: var(--color-primary);
    background: var(--color-primary);
    box-shadow: inset 0 0 0 3px var(--color-card-dark);
  }
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 64px;
    padding: 6px 10px;
    font-size: 13px;
    background: var(--color-card-dark);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    text-align: center;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }

  .unit {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.preview-section {
  margin-top: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.preview-header {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--color-border);
}

.preview-area {
  padding: 12px;
  background: var(--color-card-dark);
}

.preview-text {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 10px;
  font-family: sans-serif;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
