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

<style lang="scss" scoped>
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
