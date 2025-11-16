import * as THREE from "three";
import {SceneBase} from "~/utils/manager/scene/SceneBase.ts";
import {EventManager} from "~/utils/manager/EventManager.ts";
import type {Ref} from "vue";
import {TransformController} from "~/utils/manager/scene/controller/TransformController.ts";

export class SceneManager extends SceneBase {
    private readonly EventManager: EventManager;
    private readonly TransformController: TransformController

    constructor(divRef: Ref<HTMLDivElement>, eventManager: EventManager) {
        super(divRef)
        this.EventManager = eventManager;
        this.TransformController = new TransformController(this.scene, this.renderer, this.camera ?? this.backupCamera)

        this.EventManager.addFunction('mousedown', this.TransformController.mousedown.bind(this.TransformController))
        this.EventManager.addFunction('mousemove', this.TransformController.mousemove.bind(this.TransformController))
        this.EventManager.addFunction('mouseup', this.TransformController.mouseup.bind(this.TransformController))
    }

    public setCamera(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.TransformController.updateCamera(camera);
    }

    public addObject(object: THREE.Object3D) {
        this.scene.add(object);
    }

    public get Clock() {
        return this.clock;
    }

    public resize() {
        this.renderer.setSize(this.divRef!.value.offsetWidth, this.divRef!.value.offsetHeight);
        if (this.camera && this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = this.divRef!.value.offsetWidth / this.divRef!.value.offsetHeight;
            this.camera.updateProjectionMatrix();
        }
    }
}