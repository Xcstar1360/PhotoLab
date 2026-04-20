<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const dropZone = ref<HTMLDivElement | null>(null)

function handleClick() {
  fileInput.value?.click()
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  dropZone.value?.classList.add('dragover')
}

function handleDragLeave(e: DragEvent) {
  dropZone.value?.classList.remove('dragover')
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  dropZone.value?.classList.remove('dragover')
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    emit('fileSelected', file)
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
  }
}
</script>

<template>
  <div class="drop-zone" ref="dropZone" @click="handleClick" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
    <p>拖拽照片到这里，或点击选择文件</p>
    <input type="file" accept="image/*" @change="handleFileChange" ref="fileInput">
  </div>
</template>

<style lang="scss" scoped>
.drop-zone {
  border: 2px dashed rgba(0, 212, 255, 0.4);
  border-radius: var(--radius);
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(0, 212, 255, 0.02);
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  &:hover,
  &.dragover {
    background: rgba(0, 212, 255, 0.08);
    border-color: var(--color-primary);
    box-shadow: inset 0 0 30px var(--color-primary-glow);
  }

  p {
    color: var(--color-text-muted);
    font-size: 14px;
  }

  input {
    display: none;
  }

  &::before {
    content: '📁';
    font-size: 48px;
    opacity: 0.6;
  }
}
</style>
