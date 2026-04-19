<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WatermarkOptions } from '@photolab/shared/types'

const props = defineProps<{
  modelValue: WatermarkOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WatermarkOptions]
}>()

const opacity = ref(props.modelValue.opacity ?? 0.8)

watch(opacity, (val) => {
  emit('update:modelValue', { ...props.modelValue, opacity: val })
})
</script>

<template>
  <div class="option-group">
    <h3>水印设置</h3>
    <div class="option-row">
      <label>水印文字</label>
      <input type="text" :value="modelValue.text" @input="emit('update:modelValue', { ...modelValue, text: ($event.target as HTMLInputElement).value })" placeholder="输入水印文字">
    </div>
    <div class="option-row">
      <label>位置</label>
      <select :value="modelValue.position" @change="emit('update:modelValue', { ...modelValue, position: ($event.target as HTMLSelectElement).value as WatermarkOptions['position'] })">
        <option value="bottom-right">右下角</option>
        <option value="bottom-left">左下角</option>
        <option value="top-right">右上角</option>
        <option value="top-left">左上角</option>
        <option value="center">居中</option>
      </select>
    </div>
    <div class="option-row">
      <label>字体大小</label>
      <input type="number" :value="modelValue.fontSize" @input="emit('update:modelValue', { ...modelValue, fontSize: parseInt(($event.target as HTMLInputElement).value) })" min="12" max="72">
    </div>
    <div class="option-row">
      <label>颜色</label>
      <input type="color" :value="modelValue.color" @input="emit('update:modelValue', { ...modelValue, color: ($event.target as HTMLInputElement).value })">
    </div>
    <div class="option-row">
      <label>透明度</label>
      <input type="range" v-model="opacity" min="10" max="100">
      <span>{{ Math.round(opacity * 100) }}%</span>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles - shared styles in main.css */
</style>
