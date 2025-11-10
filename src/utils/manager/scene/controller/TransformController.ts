import * as THREE from "three";
import {TransformControls} from "three/examples/jsm/controls/TransformControls.js";
import type {SceneBase} from "~/utils/manager/scene/SceneBase.ts";

export class TransformController {
    private readonly sceneBase: SceneBase;
    private readonly transformControls: TransformControls;

    constructor(sceneBase: SceneBase) {
        this.sceneBase = sceneBase;
        this.transformControls = new TransformControls(sceneBase.Camera, sceneBase.Renderer.domElement);
    }
}

// const transformControls = new TransformControls(camera, renderer.domElement);
// scene.add(transformControls);
// // 将 TransformControls 附加到立方体
// transformControls.attach(cube);
// // 监听事件
// transformControls.addEventListener('change', () => {
//     console.log('对象正在变换');
//     renderer.render(scene, camera);
// });
//
//
// const rect = renderer.domElement.getBoundingClientRect()
// const pointer = new THREE.Vector2()
// pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
// pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
//
// const intersectedObject = threeScene.value.getObjectAtPointer(pointer, [...sceneChildList.value])
//
// if (intersectedObject) {
//     threeScene.value.attachTransformControls(intersectedObject)
//     selectedObjectName.value = intersectedObject.name
// } else {
//     threeScene.value.detachTransformControls()
//     selectedObjectName.value = null
// }