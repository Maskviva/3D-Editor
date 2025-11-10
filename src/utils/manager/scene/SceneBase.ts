import * as THREE from "three";
import type {Ref} from "vue";

export class SceneBase {
    protected readonly scene: THREE.Scene;
    protected readonly renderer: THREE.WebGLRenderer;
    protected camera: THREE.Camera | null = null;
    protected clock: THREE.Clock = new THREE.Clock();

    protected divRef: Ref<HTMLDivElement> | null = null;
    protected life: boolean = true;

    protected functions: Array<() => void> = [];

    constructor(divRef: Ref<HTMLDivElement>) {
        this.divRef = divRef;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
    }

    public init(): void {
        this.divRef?.value.appendChild(this.renderer.domElement);

        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(3, 3, 3),
            new THREE.MeshBasicMaterial({color: 0xffffff})
        );
        cube.position.set(0, 0, 5);
        this.scene.add(cube);
    }

    public run(): void {
        this.renderLoop()
    }

    public stop(): void {
        window.removeEventListener('resize', () => {
            this.renderer.setSize(this.divRef!.value.offsetWidth, this.divRef!.value.offsetHeight);
        })

        this.life = false;
        this.scene.clear();
        this.renderer.domElement.remove();
        this.camera?.clear()
        this.renderer.dispose();
    }

    protected renderLoop(): void {
        if (!this.life) return;

        this.renderer.render(this.scene, this.camera ?? new THREE.PerspectiveCamera());
        this.functions.forEach(fn => fn());
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    public pushFunction(fn: () => void): void {
        this.functions.push(fn);
    }

    public removeFunction(fn: () => void): void {
        const index = this.functions.indexOf(fn);
        if (index !== -1) {
            this.functions.splice(index)
        }
    }

    public get Scene(): THREE.Scene {
        return this.scene;
    }

    public get Renderer(): THREE.WebGLRenderer {
        return this.renderer;
    }

    public get Camera(): THREE.Camera | null {
        return this.camera;
    }
}
