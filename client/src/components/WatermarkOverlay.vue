<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch } from 'vue'
import type { WatermarkOptions, WatermarkFreePosition } from '@photolab/shared/types'

const props = defineProps<{
  options: WatermarkOptions
  containerWidth: number
  containerHeight: number
  imageWidth: number
  imageHeight: number
}>()

const emit = defineEmits<{
  'update:position': [position: WatermarkFreePosition]
}>()

const isDragging = ref(false)
const watermarkRef = ref<HTMLElement | null>(null)

// 图片在容器中的位置和尺寸（相对于容器）
const imgBounds = ref({ left: 0, top: 0, width: 0, height: 0 })

// 更新图片边界
function updateImgBounds() {
  const containerEl = document.querySelector('.preview-image-wrap')
  const imgEl = containerEl?.querySelector('img') as HTMLImageElement
  if (containerEl && imgEl) {
    const containerRect = containerEl.getBoundingClientRect()
    const imgRect = imgEl.getBoundingClientRect()
    imgBounds.value = {
      left: imgRect.left - containerRect.left,
      top: imgRect.top - containerRect.top,
      width: imgRect.width,
      height: imgRect.height
    }
  }
}

const watermarkStyle = computed(() => {
  const pos = props.options.freePosition || { xPercent: 90, yPercent: 90 }
  const rotation = props.options.type === 'text'
    ? (props.options.textOptions?.rotation || 0)
    : (props.options.logoOptions?.rotation || 0)

  const transforms: string[] = ['translate(-50%, -50%)']

  if (rotation) {
    transforms.push(`rotate(${rotation}deg)`)
  }

  const style: Record<string, string | number> = {
    position: 'absolute',
    cursor: 'move',
    userSelect: 'none',
    pointerEvents: 'auto',
    zIndex: 100,
    left: `${pos.xPercent}%`,
    top: `${pos.yPercent}%`
  }

  if (transforms.length > 0) {
    style.transform = transforms.join(' ')
  }

  if (props.options.type === 'text' && props.options.textOptions) {
    const opt = props.options.textOptions
    style.color = opt.color || '#ffffff'
    style.opacity = opt.opacity ?? 0.8
    style.fontSize = `${opt.fontSize || 24}px`
    style.fontWeight = 'bold'

    if (opt.shadow) {
      style.textShadow = `${opt.shadow.offsetX}px ${opt.shadow.offsetY}px ${opt.shadow.blur}px ${opt.shadow.color}`
    }
  }

  if (props.options.type === 'logo' && props.options.logoOptions) {
    const opt = props.options.logoOptions
    style.opacity = opt.opacity ?? 0.8
    style.width = `${opt.width || 100}px`

    if (opt.shadow) {
      style.filter = `drop-shadow(${opt.shadow.offsetX}px ${opt.shadow.offsetY}px ${opt.shadow.blur}px ${opt.shadow.color})`
    }
  }

  return style
})

// Overlay 样式：覆盖在图片上
const overlayStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${imgBounds.value.left}px`,
  top: `${imgBounds.value.top}px`,
  width: `${imgBounds.value.width}px`,
  height: `${imgBounds.value.height}px`,
  pointerEvents: 'none' as const,
  zIndex: 999
}))

function getEventCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in e) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  return { x: e.clientX, y: e.clientY }
}

function startDrag(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  e.stopPropagation()

  isDragging.value = true
  updateImgBounds()

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  e.stopPropagation()

  const coords = getEventCoords(e)
  const wmEl = watermarkRef.value
  if (!wmEl) return

  updateImgBounds()

  // imgBounds 现在是相对于容器的，所以需要将鼠标坐标也转为容器相对坐标
  const containerEl = document.querySelector('.preview-image-wrap')
  if (!containerEl) return
  const containerRect = containerEl.getBoundingClientRect()

  // 鼠标相对于容器的坐标
  const mouseRelX = coords.x - containerRect.left
  const mouseRelY = coords.y - containerRect.top

  // 水印中心相对于图片的位置
  const relX = mouseRelX - imgBounds.value.left
  const relY = mouseRelY - imgBounds.value.top

  // 计算百分比（基于图片尺寸）
  let xPercent = (relX / imgBounds.value.width) * 100
  let yPercent = (relY / imgBounds.value.height) * 100

  // 约束：确保水印整体不超出图片边界
  const wmRect = wmEl.getBoundingClientRect()
  const wmWidthPercent = (wmRect.width / imgBounds.value.width) * 100
  const wmHeightPercent = (wmRect.height / imgBounds.value.height) * 100

  const minX = wmWidthPercent / 2
  const maxX = 100 - wmWidthPercent / 2
  const minY = wmHeightPercent / 2
  const maxY = 100 - wmHeightPercent / 2

  xPercent = Math.max(minX, Math.min(maxX, xPercent))
  yPercent = Math.max(minY, Math.min(maxY, yPercent))

  emit('update:position', { xPercent, yPercent })
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})

// 监听图片尺寸变化和组件挂载
watch(() => [props.imageWidth, props.imageHeight], () => {
  updateImgBounds()
})

// 组件挂载后也更新边界
onMounted(() => {
  updateImgBounds()
})
</script>

<template>
  <div class="watermark-overlay" :style="overlayStyle">
    <div
      v-if="(options.type === 'text' && options.textOptions) || (options.type === 'logo' && options.logoOptions?.logoUrl)"
      ref="watermarkRef"
      class="watermark-overlay-item"
      :style="watermarkStyle"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <template v-if="options.type === 'text' && options.textOptions">
        {{ options.textOptions.text }}
      </template>
      <template v-else-if="options.type === 'logo' && options.logoOptions?.logoUrl">
        <img
          :src="options.logoOptions.logoUrl"
          alt="Watermark logo"
          draggable="false"
          style="width: 100%; height: auto; display: block;"
        >
      </template>
    </div>
  </div>
</template>

<style scoped>
.watermark-overlay {
  top: 0;
  left: 0;
}

.watermark-overlay-item {
  display: inline-block;
  white-space: nowrap;
  box-sizing: border-box;
}
</style>
