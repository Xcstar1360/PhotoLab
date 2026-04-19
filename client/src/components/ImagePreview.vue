<script setup lang="ts">
const emit = defineEmits<{
  fileSelected: [file: File]
}>()

defineProps<{
  originalUrl: string
  processedUrl: string
}>()
</script>

<template>
  <div class="preview-wrapper">
    <div class="preview-container">
      <div class="preview-box">
        <div class="preview-label">原图</div>
        <div class="preview-image-wrap">
          <img :src="originalUrl" alt="Original">
        </div>
      </div>
      <div class="preview-box" v-if="processedUrl">
        <div class="preview-label">处理后</div>
        <div class="preview-image-wrap">
          <img :src="processedUrl" alt="Processed">
        </div>
      </div>
    </div>
    <button class="btn-change" @click="emit('fileSelected', null as any)">更换图片</button>
  </div>
</template>

<style scoped>
/* Styles moved to main.css */
</style>
