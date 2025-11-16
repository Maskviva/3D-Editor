<template>
  <div ref="canvasDomRef" class="canvas">
    <component :is="node.component"
               v-for="node in nodeCanvasStore.nodes"
               :key="node.id"
               v-model:id="node.id"
               :color="node.color"
               :in-choose="node.inChoose"
               :offset="node.offset"
               :scale="node.scale"

               @handleOnDragEnd="handleOnDragEnd"
               @handleOnDragStart="handleOnDragStart"
               @nodeOnDragStart="nodeCanvasStore.nodeStart"
               @nodeOnDragMove="nodeCanvasStore.nodeMove"
    />

    <component :is="edge.component"
               v-for="edge in nodeCanvasStore.edges"
               :key="edge.id"
               :id="edge.id"
               :end="edge.end"
               :start="edge.start"
               color="#000"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseNode from "~/components/node/base/BaseNode.vue";
import {useNodeCanvasStore} from "~/store/useNodeCanvasStore.ts";
import {markRaw, onMounted, ref} from "vue";
import BaseEdge from "~/components/node/base/BaseEdge.vue";

const nodeCanvasStore = useNodeCanvasStore();

const canvasDomRef = ref<HTMLElement>()

const isDragging = ref(false);
let draggingEdgeId: string | null = null;
let edgeFromId = "";

const removeEdge = () => {
  let i = -1
  nodeCanvasStore.edges.find((edge, index) => {
    if (edge.id === draggingEdgeId) {
      i = index;
    }
  })

  if (i >= 0) {
    nodeCanvasStore.edges.splice(i, 1);
  }
}

const handleOnDragEnd = (e: MouseEvent) => {
  isDragging.value = false;

  const chooseDom = document.elementFromPoint(e.clientX, e.clientY);
  if (!(chooseDom instanceof HTMLElement)) return

  const isHandle = typeof chooseDom.dataset.handle === 'string'

  if (draggingEdgeId && isHandle) {
    const parentId = (chooseDom.parentNode!.parentNode!.parentNode as HTMLElement).id;

    if (parentId === edgeFromId) return removeEdge();

    nodeCanvasStore.edges.find(edge => {
      if (edge.id === draggingEdgeId) {
        edge.to = parentId;
        edge.end = {
          x: e.clientX,
          y: e.clientY
        };
      }
    })

    draggingEdgeId = null;
  } else removeEdge()
}

const handleOnDragStart = (e: MouseEvent) => {
  isDragging.value = true;

  const edgeTempId = Date.now().toString() + '-edge';

  const chooseDom = document.elementFromPoint(e.clientX, e.clientY);
  if (!(chooseDom instanceof HTMLElement)) return

  const isHandle = typeof chooseDom.dataset.handle === 'string'

  if (isHandle) {
    edgeFromId = (chooseDom.parentNode!.parentNode!.parentNode as HTMLElement).id;
  }

  nodeCanvasStore.edges.push({
    id: edgeTempId,
    component: markRaw(BaseEdge),
    start: {x: e.clientX, y: e.clientY},
    end: {x: e.clientX, y: e.clientY},
    from: edgeFromId,
    to: '',
    color: '#000'
  })

  draggingEdgeId = edgeTempId;
}

onMounted(() => {
  window.addEventListener('mousemove', (e) => {
    if (!isDragging.value || !draggingEdgeId) return;

    const edge = nodeCanvasStore.edges.find(edge => edge.id === draggingEdgeId);
    if (edge) {
      edge.end = {
        x: e.clientX,
        y: e.clientY
      };
    }
  })

  nodeCanvasStore.nodes.push({
    id: Date.now().toString() + Math.random() + '-node',
    component: markRaw(BaseNode),
    color: '#4a90e2',
    scale: 1,
    offset: {x: 0, y: 0}
  }, {
    id: Date.now().toString() + Math.random() + '-node',
    component: markRaw(BaseNode),
    color: '#000000',
    scale: 1,
    offset: {x: 0, y: 0}
  }, {
    id: Date.now().toString() + Math.random() + '-node',
    component: markRaw(BaseNode),
    color: '#486544',
    scale: 1,
    offset: {x: 0, y: 0}
  })

  nodeCanvasStore.setCanvasDom(canvasDomRef.value!)
})
</script>

<style scoped>
.canvas {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.canvas:active {
  cursor: move;
}
</style>