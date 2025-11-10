import * as THREE from "three";
import type {Ref} from "vue";

export class SceneManager {
    private readonly scene: THREE.Scene;
    private readonly renderer: THREE.WebGLRenderer;
    private camera: THREE.Camera | null = null;

    private divRef: Ref<HTMLDivElement> | null = null;
    private life: boolean = true;

    private functions: Array<() => void> = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
    }

    public init(divRef: Ref<HTMLDivElement>): void {
        this.divRef = divRef;

        divRef.value.appendChild(this.renderer.domElement);

        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(3, 3, 3),
            new THREE.MeshBasicMaterial({color: 0xffffff})
        );
        cube.position.set(0, 0, 5);
        this.scene.add(cube);

        this.addLight()
    }

    public addLight() {
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5)
        this.scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(100, 20, 100)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 4096
        directionalLight.shadow.mapSize.height = 4096
        directionalLight.shadow.camera.near = 0.5
        directionalLight.shadow.camera.far = 500
        directionalLight.shadow.camera.left = -100
        directionalLight.shadow.camera.right = 100
        directionalLight.shadow.camera.top = 100
        directionalLight.shadow.camera.bottom = -100

        directionalLight.shadow.bias = -0.001
        directionalLight.shadow.normalBias = 0.05

        this.scene.add(directionalLight)
    }

    public setCamera(camera: THREE.Camera): void {
        this.camera = camera;
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

    private renderLoop(): void {
        if (!this.life) return;

        this.renderer.render(this.scene, this.camera ?? new THREE.PerspectiveCamera());
        this.functions.forEach(fn => fn());
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    public resize() {
        this.renderer.setSize(this.divRef!.value.offsetWidth, this.divRef!.value.offsetHeight);
        if (this.camera && this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = this.divRef!.value.offsetWidth / this.divRef!.value.offsetHeight;
            this.camera.updateProjectionMatrix();
        }
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
}