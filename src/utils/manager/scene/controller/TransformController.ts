import * as THREE from "three";
import {TransformControls} from "three/examples/jsm/controls/TransformControls.js";

export class TransformController {
    private static readonly CHOOSE_CALLBACK: Array<() => void> = [];
    public static CHOOSE_OBJECT: THREE.Object3D | null = null;

    public static addChooseCallback(callback: () => void) {
        TransformController.CHOOSE_CALLBACK.push(callback);
    }

    private readonly scene: THREE.Scene;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly raycaster: THREE.Raycaster;
    private readonly transformControls: TransformControls;

    private camera: THREE.Camera;
    private isDragging: boolean = false;
    private mouseDownPosition: { x: number; y: number } = {x: 0, y: 0};
    private dragThreshold: number = 5; // 拖动阈值

    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);

        this.scene.add(this.transformControls);
        this.eventBind();

        // 标记 TransformControls 的辅助对象
        this.markTransformControlsHelpers();
    }

    public mousedown(event: MouseEvent) {
        if (event.button != 0) return;

        this.mouseDownPosition.x = event.clientX;
        this.mouseDownPosition.y = event.clientY;
        this.isDragging = false;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const pointer = new THREE.Vector2();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (!this.camera) return;

        this.raycaster.setFromCamera(pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        const validIntersects = intersects.filter(intersect => {
            const object = intersect.object;

            // 排除 TransformControls 及其辅助对象
            if (this.isTransformControlsOrHelper(object)) {
                return false;
            }

            // 只选择标记为可选择的物体
            return object.userData.canChoose === true;
        });

        if (validIntersects.length > 0 && validIntersects[0]) {
            const intersectedObject = validIntersects[0].object;
            this.transformControls.attach(intersectedObject);
            TransformController.CHOOSE_OBJECT = intersectedObject;
            console.log('选择对象:', intersectedObject.uuid);
        } else {
            // 检查是否点击了 TransformControls 的控制柄
            const isClickingGizmo = intersects.some(intersect =>
                this.isTransformControlsHelper(intersect.object)
            );

            if (!isClickingGizmo) {
                console.log('点击空白区域，取消选择');
                this.transformControls.detach();
                TransformController.CHOOSE_OBJECT = null;
            }
        }
    }

    public mousemove(event: MouseEvent) {
        if (event.button != 0) return;

        // 检查是否开始拖动
        if (!this.isDragging) {
            const deltaX = Math.abs(event.clientX - this.mouseDownPosition.x);
            const deltaY = Math.abs(event.clientY - this.mouseDownPosition.y);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > this.dragThreshold) {
                this.isDragging = true;

                console.log('开始拖动');
            }
        }
    }

    public mouseup(event: MouseEvent) {
        if (event.button != 0) return;

        if (!this.isDragging) {
            console.log('完成点击操作');
        }

        this.isDragging = false;
    }

    public updateCamera(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.transformControls.camera = camera;
    }

    private eventBind() {
        this.transformControls.addEventListener('change', () => {
            this.renderer.render(this.scene, this.camera);
            TransformController.CHOOSE_CALLBACK.forEach(callback => {
                callback();
            });
        });
    }

    // 标记 TransformControls 的辅助对象
    private markTransformControlsHelpers() {
        this.transformControls.traverse((child) => {
            child.userData.isTransformHelper = true;
        });
    }

    private isTransformControlsOrHelper(object: THREE.Object3D): boolean {
        return object === this.transformControls ||
            object.userData.isTransformHelper === true ||
            this.isTransformControlsHelper(object);
    }

    private isTransformControlsHelper(object: THREE.Object3D): boolean {
        const objectName = object.name || '';
        return ['X', 'Y', 'Z', 'E', 'XY', 'YZ', 'XZ', 'XYZ', 'AXIS', 'PLANE', 'DELTA'].includes(objectName);
    }
}