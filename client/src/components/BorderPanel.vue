<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BorderOptions } from '@photolab/shared/types'

const props = defineProps<{
  modelValue: BorderOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BorderOptions]
}>()

const showColorBar = ref(props.modelValue.type === 'color-bar')
const blurRadius = ref(props.modelValue.blurRadius ?? 20)

watch(() => props.modelValue.type, (type) => {
  showColorBar.value = type === 'color-bar'
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
  <div class="option-group">
    <h3>边框设置</h3>
    <div class="option-row">
      <label>边框类型</label>
      <select :value="modelValue.type" @change="handleTypeChange">
        <option value="color-bar">纯色边框</option>
        <option value="blur">模糊边框</option>
      </select>
    </div>
    <div class="option-row" v-if="showColorBar">
      <label>边框颜色</label>
      <input type="color" :value="modelValue.color" @input="emit('update:modelValue', { ...modelValue, color: ($event.target as HTMLInputElement).value })">
      <label style="margin-left: 20px;">
        <input type="checkbox" :checked="modelValue.dominantColor" @change="emit('update:modelValue', { ...modelValue, dominantColor: ($event.target as HTMLInputElement).checked })"> 使用主色调
      </label>
    </div>
    <div class="option-row">
      <label>边框宽度</label>
      <input type="number" :value="modelValue.barWidth" @input="emit('update:modelValue', { ...modelValue, barWidth: parseInt(($event.target as HTMLInputElement).value) })" min="20" max="200">
    </div>
    <div class="option-row" v-if="!showColorBar">
      <label>模糊程度</label>
      <input type="range" v-model="blurRadius" min="5" max="50">
      <span>{{ blurRadius }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles - shared styles in main.css */
</style>
