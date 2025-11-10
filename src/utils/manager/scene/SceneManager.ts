import * as THREE from "three";
import {SceneBase} from "~/utils/manager/scene/SceneBase.ts";
import type {Ref} from "vue";

export class SceneManager extends SceneBase {
    constructor(divRef: Ref<HTMLDivElement>) {
        super(divRef)
    }

    public setCamera(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
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