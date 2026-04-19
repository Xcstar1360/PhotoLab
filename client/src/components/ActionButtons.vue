<script setup lang="ts">
defineProps<{
  isProcessing: boolean
  showDownload: boolean
}>()

const emit = defineEmits<{
  process: []
  download: []
}>()
</script>

<template>
  <div class="btn-group">
    <button class="btn" :disabled="isProcessing" @click="emit('process')">
      {{ isProcessing ? '处理中...' : '处理照片' }}
    </button>
    <button class="btn" v-if="showDownload" @click="emit('download')">下载结果</button>
  </div>
</template>

<style scoped>
/* Styles moved to main.css */
</style>
