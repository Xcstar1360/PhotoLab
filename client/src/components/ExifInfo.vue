<script setup lang="ts">
import type { ExifData } from '@photolab/shared/types'

defineProps<{
  exif: ExifData | null
}>()

function formatExif(exif: ExifData): Array<{ label: string; value: string }> {
  const items: Array<{ label: string; value: string }> = []

  if (exif?.camera) {
    items.push({ label: '相机', value: `${exif.camera.make || ''} ${exif.camera.model || ''}` })
    if (exif.camera.lens) {
      items.push({ label: '镜头', value: exif.camera.lens })
    }
  }

  if (exif?.settings) {
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

  if (exif?.timestamp) {
    items.push({ label: '拍摄时间', value: new Date(exif.timestamp).toLocaleString() })
  }

  if (exif?.gps?.latitude && exif?.gps?.longitude) {
    items.push({ label: 'GPS', value: `${exif.gps.latitude.toFixed(4)}, ${exif.gps.longitude.toFixed(4)}` })
  }

  items.push({ label: '尺寸', value: `${exif?.imageWidth || '?'} × ${exif?.imageHeight || '?'}` })

  return items
}
</script>

<template>
  <div class="exif-info" v-if="exif">
    <template v-for="item in formatExif(exif)" :key="item.label">
      <dt>{{ item.label }}</dt>
      <dd>{{ item.value }}</dd>
    </template>
  </div>
</template>

<style scoped>
/* Styles moved to main.css */
</style>
