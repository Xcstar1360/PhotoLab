<script setup lang="ts">
import { computed } from 'vue'
import type { ExifData } from '@photolab/shared/types'

const props = defineProps<{
  exif: ExifData | null
}>()

const formattedExif = computed(() => {
  const exif = props.exif
  const items: Array<{ label: string; value: string }> = []

  if (!exif) return items

  if (exif.camera) {
    items.push({ label: '相机', value: `${exif.camera.make || ''} ${exif.camera.model || ''}` })
    if (exif.camera.lens) {
      items.push({ label: '镜头', value: exif.camera.lens })
    }
  }

  if (exif.settings) {
    const s = exif.settings
    const parts: string[] = []
    if (s.iso) parts.push(`ISO ${s.iso}`)
    if (s.aperture) parts.push(`f/${s.aperture}`)
    if (s.shutterSpeed) parts.push(`${s.shutterSpeed}`)
    if (s.focalLength) parts.push(`${s.focalLength}mm`)
    if (parts.length) {
      items.push({ label: '参数', value: parts.join(' ') })
    }
    if (s.flash !== undefined) {
      items.push({ label: '闪光灯', value: s.flash ? '开启' : '关闭' })
    }
  }

  if (exif.timestamp) {
    items.push({ label: '拍摄时间', value: new Date(exif.timestamp).toLocaleString() })
  }

  if (exif.gps?.latitude && exif.gps?.longitude) {
    items.push({ label: 'GPS', value: `${exif.gps.latitude.toFixed(4)}, ${exif.gps.longitude.toFixed(4)}` })
  }

  items.push({ label: '尺寸', value: `${exif.imageWidth || '?'} × ${exif.imageHeight || '?'}` })

  return items
})
</script>

<template>
  <dl class="exif-info" v-if="exif">
    <template v-for="item in formattedExif" :key="item.label">
      <dt>{{ item.label }}</dt>
      <dd>{{ item.value }}</dd>
    </template>
  </dl>
</template>

<style lang="scss" scoped>
.exif-info {
  font-size: 13px;
  line-height: 1.8;

  dt {
    color: var(--color-text-muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  dd {
    color: var(--color-text);
    padding: 6px 0 12px 0;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 4px;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
