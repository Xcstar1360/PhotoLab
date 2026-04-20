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

<style lang="scss" scoped>
.preview-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.preview-box {
  flex: 1;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color 0.3s;

  &:hover {
    border-color: var(--color-primary);
  }
}

.preview-label {
  flex-shrink: 0;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--color-border);
}

.preview-image-wrap {
  flex: 1;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}

.btn-change {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 16px;

  &:hover {
    background: var(--color-panel-hover);
    color: var(--color-text);
    border-color: var(--color-primary);
  }
}
</style>
