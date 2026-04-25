<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function openPicker() {
  inputRef.value?.click()
}

function handleChange(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

const displayColor = computed(() => {
  return props.modelValue || '#000000'
})
</script>

<template>
  <div class="color-picker" @click="openPicker">
    <div class="color-preview" :style="{ backgroundColor: displayColor }"></div>
    <input
      ref="inputRef"
      type="color"
      :value="displayColor"
      @input="handleChange"
    >
  </div>
</template>

<style scoped>
.color-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid var(--color-border);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  transition: border-color 0.15s, transform 0.15s;
}

.color-picker:hover .color-preview {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.color-picker input[type="color"] {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
