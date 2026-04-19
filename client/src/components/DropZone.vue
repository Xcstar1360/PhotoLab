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

<style scoped>
/* Styles moved to main.css */
</style>
