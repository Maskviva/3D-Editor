import {defineStore} from "pinia";
import {type Component, readonly, type Ref, ref, watch} from "vue";

const scaleAmplitude = 0.1;
const maxScale = 2;
const minScale = 0.1;

export interface CanvasNode {
    id: string;
    component: Component;
    color?: string;
    scale: number;
    offset: { x: number; y: number };
    inChoose?: boolean;
}

export interface CanvasEdge {
    id: string;
    component: Component;
    start: { x: number; y: number };
    end: { x: number; y: number };
    from: string;
    to: string;
    color?: string;
}

export const useNodeCanvasStore = defineStore('nodeCanvas', () => {
    const canvasDom = ref<HTMLElement>();
    const canvasOffset = ref({x: 0, y: 0});
    const canvasScale = ref(1);

    const nodes: Ref<CanvasNode[]> = ref([])
    const edges: Ref<CanvasEdge[]> = ref([])

    let canMove = false;
    let initial = {
        mouse: {
            x: 0,
            y: 0,
        },
        offset: {
            x: 0,
            y: 0,
        },
    };

    watch([canvasOffset, canvasScale], (newValue, oldValue) => {
        nodes.value.forEach(node => {
            node.offset = newValue[0]
            node.scale = newValue[1];
        });
        edges.value.forEach(edge => {
            const scaleRatio = newValue[1] / oldValue[1];
            edge.start.x = (edge.start.x - oldValue[0].x) * scaleRatio + newValue[0].x;
            edge.start.y = (edge.start.y - oldValue[0].y) * scaleRatio + newValue[0].y;
            edge.end.x = (edge.end.x - oldValue[0].x) * scaleRatio + newValue[0].x;
            edge.end.y = (edge.end.y - oldValue[0].y) * scaleRatio + newValue[0].y;
        });
    })

    const setCanvasDom = (dom: HTMLElement) => {
        if (canvasDom.value) throw new Error('setCanvasDom 已经被设置');
        canvasDom.value = dom;
        bindEvents();
    };

    const cleanup = () => {
        if (canvasDom.value) {
            canvasDom.value.removeEventListener('wheel', handleWheel);
            canvasDom.value.removeEventListener('mousedown', handleMouseDown);
        }
        canvasDom.value!.removeEventListener('mousemove', handleMouseMove);
        canvasDom.value!.removeEventListener('mouseup', handleMouseUp);
    };

    const handleNodeMove = (e: { id: string; x: number; y: number; }) => {
        const node = nodes.value.find(i => i.id == e.id);

        if (node) {
            edges.value.forEach(edge => {
                if (edge.from === e.id) {
                    edge.start.x += e.x / canvasScale.value;
                    edge.start.y += e.y / canvasScale.value;
                }
                if (edge.to === e.id) {
                    edge.end.x += e.x / canvasScale.value;
                    edge.end.y += e.y / canvasScale.value;
                }
            });
        }
    };

// 工具函数
    const bindEvents = () => {
        if (!canvasDom.value) return;

        canvasDom.value.addEventListener('wheel', handleWheel, {passive: false});

        canvasDom.value.addEventListener('mousedown', handleMouseDown);
    };

    const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        if (!canvasDom.value) return;

        const direction = event.deltaY > 0 ? -scaleAmplitude : scaleAmplitude;
        const newScale = canvasScale.value + direction;

        if (newScale >= minScale && newScale <= maxScale) {
            const mouseX = event.clientX - canvasOffset.value.x;
            const mouseY = event.clientY - canvasOffset.value.y;

            const mouseXRelative = mouseX / canvasScale.value;
            const mouseYRelative = mouseY / canvasScale.value;

            canvasScale.value = newScale;

            canvasOffset.value = {
                x: event.clientX - mouseXRelative * newScale,
                y: event.clientY - mouseYRelative * newScale
            };
        }
    };

    const handleMouseDown = (event: MouseEvent) => {
        if (event.target === canvasDom.value) {
            canMove = true;

            initial.mouse.x = event.clientX;
            initial.mouse.y = event.clientY;
            initial.offset.x = canvasOffset.value.x;
            initial.offset.y = canvasOffset.value.y;

            canvasDom.value.addEventListener('mousemove', handleMouseMove);
            canvasDom.value.addEventListener('mouseup', handleMouseUp);
            event.preventDefault();
        }
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!canMove) return;

        const deltaX = event.clientX - initial.mouse.x;
        const deltaY = event.clientY - initial.mouse.y;

        canvasOffset.value = {
            x: initial.offset.x + deltaX,
            y: initial.offset.y + deltaY
        };
    };

    const handleMouseUp = () => {
        canMove = false;
        canvasDom.value!.removeEventListener('mousemove', handleMouseMove);
        canvasDom.value!.removeEventListener('mouseup', handleMouseUp);
    };

    return {
        nodes,
        edges,
        canvasScale: readonly(canvasScale),
        canvasOffset: readonly(canvasOffset),
        setCanvasDom,
        cleanup,
        handleNodeMove,
    };
});