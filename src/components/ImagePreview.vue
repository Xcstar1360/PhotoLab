<script setup lang="ts">
defineProps<{
  originalUrl: string
  processedUrl: string
}>()
</script>

<template>
  <div class="preview-container">
    <div class="preview-box">
      <h3>原图</h3>
      <img :src="originalUrl" alt="Original">
    </div>
    <div class="preview-box">
      <h3>处理后</h3>
      <img :src="processedUrl" alt="Processed">
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.preview-box {
  flex: 1;
  min-width: 280px;
  background: var(--color-card-dark);
  border-radius: 8px;
  padding: 15px;
}

.preview-box img {
  width: 100%;
  border-radius: 4px;
}

.preview-box h3 {
  margin-bottom: 10px;
}
</style>
