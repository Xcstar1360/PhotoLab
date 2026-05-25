<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ColorPicker from './ColorPicker.vue'
import type { BorderOptions } from '@photolab/shared/types'

const props = defineProps<{
  modelValue: BorderOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BorderOptions]
}>()

const showColorBar = ref(props.modelValue.type === 'color-bar')
const blurRadius = ref(props.modelValue.blurRadius ?? 20)

const blurProgress = computed(() => {
  return `${((blurRadius.value - 5) / (50 - 5)) * 100}%`
})

watch(() => props.modelValue.type, (type) => {
  showColorBar.value = type === 'color-bar'
})

watch(() => props.modelValue.blurRadius, (val) => {
  if (val !== undefined) blurRadius.value = val
})

watch(blurRadius, (val) => {
  emit('update:modelValue', { ...props.modelValue, blurRadius: val })
})

function handleTypeChange(e: Event) {
  const type = (e.target as HTMLSelectElement).value as BorderOptions['type']
  showColorBar.value = type === 'color-bar'
  emit('update:modelValue', { ...props.modelValue, type })
}
</script>

<template>
  <div class="option-group border-panel">
    <h3>边框设置</h3>
    <div class="form-row">
      <label class="form-label" for="border-type">类型</label>
      <select id="border-type" :value="modelValue.type" @change="handleTypeChange">
        <option value="color-bar">纯色边框</option>
        <option value="blur">模糊边框</option>
      </select>
    </div>
    <div class="form-row color-row" v-if="showColorBar">
      <label class="form-label">颜色</label>
      <ColorPicker :model-value="modelValue.color || '#1a1a1a'" @update:model-value="(v) => emit('update:modelValue', { ...modelValue, color: v })" />
      <label class="checkbox-label">
        <input type="checkbox" :checked="modelValue.dominantColor" @change="emit('update:modelValue', { ...modelValue, dominantColor: ($event.target as HTMLInputElement).checked })">
        <span>自动</span>
      </label>
    </div>
    <div class="form-row">
      <label class="form-label" for="border-barWidth">宽度</label>
      <input id="border-barWidth" type="number" :value="modelValue.barWidth" @input="emit('update:modelValue', { ...modelValue, barWidth: parseInt(($event.target as HTMLInputElement).value) })" min="20" max="200">
    </div>
    <div class="form-row" v-if="!showColorBar">
      <label class="form-label" for="border-blurRadius">模糊</label>
      <div class="slider-container">
        <input id="border-blurRadius" type="range" v-model="blurRadius" min="5" max="50" :style="{ '--range-progress': blurProgress }">
        <span class="slider-value">{{ blurRadius }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.border-panel {
  .color-row {
    flex-wrap: wrap;
  }

  .checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--color-text-muted);
    cursor: pointer;
    margin-left: 8px;
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .slider-value {
    min-width: 36px;
    text-align: center;
    font-size: 13px;
    color: var(--color-text);
    font-weight: 500;
  }
}
</style>
