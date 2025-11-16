<template>
  <div
      :id="id"
      ref="baseNodeRef"
      :style="nodeStyle"
      class="base-node"
      @mousedown="dragStart"
  >
    <div class="node-header">
      <slot name="header">节点标题</slot>
      <BaseHandle :scale="scale" @handleOnDragEnd="emit('handleOnDragEnd', $event)"
                  @handleOnDragStart="emit('handleOnDragStart', $event)"/>
    </div>
    <div class="node-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onUnmounted, ref, watch} from "vue";
import BaseHandle from "~/components/node/base/BaseHandle.vue";

const props = withDefaults(defineProps<{
  id: string;
  color?: string;
  scale: number;
  offset: { x: number; y: number };
  inChoose?: boolean;
}>(), {
  color: '#888',
  inChoose: false,
});

const emit = defineEmits<{
  (e: 'handleOnDragStart', event: MouseEvent): void;
  (e: 'handleOnDragEnd', event: MouseEvent): void;
  (e: 'nodeOnDragStart', event: { id: string }): void;
  (e: 'nodeOnDragMove', event: { id: string; x: number; y: number; }): void;
}>();

const baseNodeRef = ref<HTMLDivElement>();

const nodePosition = ref({x: 0, y: 0});
const displayPosition = ref({x: 0, y: 0});

const nodeStyle = computed(() => ({
  left: `${displayPosition.value.x}px`,
  top: `${displayPosition.value.y}px`,
  transform: `scale(${props.scale})`,
  transformOrigin: 'top left',
  zIndex: props.inChoose ? 9999 : 1,
}));

const updateDisplayPosition = () => {
  displayPosition.value = {
    x: nodePosition.value.x * props.scale + props.offset.x,
    y: nodePosition.value.y * props.scale + props.offset.y
  };
};

watch([() => props.scale, () => props.offset], () => {
  updateDisplayPosition();
}, {immediate: true});

let isDragging = false;
let dragStartPosition = {x: 0, y: 0};
let nodeStartPosition = {x: 0, y: 0};

const dragStart = (e: MouseEvent) => {
  if (!baseNodeRef.value || (e.target as HTMLElement).closest('.base-handle')) return;

  isDragging = true;
  dragStartPosition.x = e.clientX;
  dragStartPosition.y = e.clientY;
  nodeStartPosition.x = nodePosition.value.x;
  nodeStartPosition.y = nodePosition.value.y;

  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', dragStop);
  e.preventDefault();
  e.stopPropagation();
  emit('nodeOnDragStart', {id: props.id})
};

const drag = (e: MouseEvent) => {
  if (!isDragging) return;

  const deltaX = (e.clientX - dragStartPosition.x) / props.scale;
  const deltaY = (e.clientY - dragStartPosition.y) / props.scale;

  nodePosition.value = {
    x: nodeStartPosition.x + deltaX,
    y: nodeStartPosition.y + deltaY
  };

  updateDisplayPosition();

  emit('nodeOnDragMove', {x: e.movementX, y: e.movementY, id: props.id})
};

const dragStop = () => {
  isDragging = false;
  window.removeEventListener('mousemove', drag);
  window.removeEventListener('mouseup', dragStop);
};

onUnmounted(() => {
  window.removeEventListener('mousemove', drag);
  window.removeEventListener('mouseup', dragStop);
});
</script>

<style scoped>
.base-node {
  min-width: 150px;
  background: #fdfdfd;
  position: absolute;
  border: 2px solid v-bind(color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  cursor: grab;
  user-select: none;
  will-change: transform;
}

.base-node:active {
  cursor: grabbing;
}

.node-header {
  padding: 4px 6px;
  color: white;
  position: relative;
  background-color: v-bind(color);
  font-weight: 500;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.node-content {
  padding: 12px;
}
</style>