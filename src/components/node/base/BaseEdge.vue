<template>
  <svg :style="containerStyle" class="edge-container">
    <path :d="pathD" :style="edgeStyle" class="edge-path"/>
  </svg>
</template>

<script lang="ts" setup>
import {computed, type CSSProperties} from "vue";

const props = withDefaults(defineProps<{
  id: string;
  color?: string;
  start: { x: number, y: number };
  end: { x: number, y: number };
}>(), {
  color: '#9ca3af',
});

const offsetX = computed(() => Math.min(props.start.x, props.end.x));
const offsetY = computed(() => Math.min(props.start.y, props.end.y));

const width = computed(() => Math.abs(props.start.x - props.end.x));
const height = computed(() => Math.abs(props.start.y - props.end.y));

const containerStyle = computed((): CSSProperties => {
  return {
    position: 'absolute',
    left: `${offsetX.value}px`,
    top: `${offsetY.value}px`,
    width: `${width.value}px`,
    height: `${height.value}px`,
  }
});

const pathD = computed(() => {
  const localStart = {
    x: props.start.x - offsetX.value,
    y: props.start.y - offsetY.value
  };
  const localEnd = {
    x: props.end.x - offsetX.value,
    y: props.end.y - offsetY.value
  };

  const direction = Math.sign(props.end.x - props.start.x);

  const horizontalOffset = width.value * 0.5;

  const c1x = localStart.x + horizontalOffset * direction;
  const c1y = localStart.y;

  const c2x = localEnd.x - horizontalOffset * direction;
  const c2y = localEnd.y;

  return `M ${localStart.x} ${localStart.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${localEnd.x} ${localEnd.y}`;
});


const edgeStyle = computed(() => ({
  stroke: props.color,
}));
</script>

<style scoped>
.edge-container {
  width: 0;
  height: 0;
  pointer-events: none;
  overflow: visible;
  z-index: 10000;
}

.edge-path {
  fill: none;
  stroke-width: 2px;
  stroke-linecap: round;
}
</style>