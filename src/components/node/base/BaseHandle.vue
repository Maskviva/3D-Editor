<template>
  <div class="node-handle-container">
    <span v-if="!hasCustom" class="base-handle" data-handle @mousedown="handleOnDragStart"></span>
    <slot v-else data-handle name="custom" @mousedown="handleOnDragStart"></slot>
  </div>
</template>

<script lang="ts" setup>
import {useSlots} from 'vue'

const slots = useSlots();

const hasCustom = !!slots.custom;

const props = defineProps<{
  handleColor?: string;
}>();

const emit = defineEmits<{
  (e: 'handleOnDragStart', event: MouseEvent): void;
  (e: 'handleOnDragEnd', event: MouseEvent): void;
}>();

const handleOnDragStart = (e: MouseEvent) => {
  e.preventDefault();
  const element = e.target as HTMLElement;
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  emit('handleOnDragStart', {
    ...e,
    clientX: centerX,
    clientY: centerY
  } as MouseEvent);
  window.addEventListener('mouseup', handleOnDragEnd);
}

const handleOnDragEnd = (e: MouseEvent) => {
  e.preventDefault();
  const element = e.target as HTMLElement;
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  emit('handleOnDragEnd', {
    ...e,
    clientX: centerX,
    clientY: centerY
  });
  window.removeEventListener('mouseup', handleOnDragEnd);
}
</script>

<style scoped>
.node-handle-container {
  position: relative;
}

.base-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  border: 2px solid #4a90e2;
  cursor: crosshair;
  transform: translate(-50%, -50%);
  z-index: 10;
  transition: background-color 0.2s ease;
}

.base-handle:hover {
  background-color: #4a90e2;
  transform: translate(-50%, -50%) scale(1.2);
}

</style>