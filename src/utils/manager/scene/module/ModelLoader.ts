import * as THREE from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader.js";
import {type GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {type Collada, ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {Rhino3dmLoader} from "three/examples/jsm/loaders/3DMLoader.js";
import {STLLoader} from "three/examples/jsm/loaders/STLLoader.js";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader.js";

export interface ModelLoaderMap {
    "OBJ": OBJLoader;
    "FBX": FBXLoader;
    "GLTF": GLTFLoader;
    "Collada": ColladaLoader;
    "Rhino3dm": Rhino3dmLoader;
    "STL": STLLoader;
    "PLY": PLYLoader;
}

export interface ModelDataMap {
    "OBJ": THREE.Group;
    "FBX": THREE.Group;
    "GLTF": GLTF;
    "Collada": Collada;
    "Rhino3dm": THREE.Object3D;
    "STL": THREE.BufferGeometry;
    "PLY": THREE.BufferGeometry;
}

export type ModelFormat = keyof ModelLoaderMap;
export type ModelData<T extends ModelFormat> = ModelDataMap[T];

type AnyModelData =
    | THREE.Group
    | GLTF
    | Collada
    | THREE.Object3D
    | THREE.BufferGeometry;

export class ModelLoader<T extends ModelFormat = ModelFormat> {
    private readonly loader: ModelLoaderMap[T];
    private readonly format: T;

    constructor(format: T, manager?: THREE.LoadingManager) {
        this.format = format;
        this.loader = this.createLoader(format, manager);
    }

    private createLoader(format: T, manager?: THREE.LoadingManager): ModelLoaderMap[T] {
        const loaders: Record<ModelFormat, () => any> = {
            "OBJ": () => new OBJLoader(manager),
            "FBX": () => new FBXLoader(manager),
            "GLTF": () => new GLTFLoader(manager),
            "Collada": () => new ColladaLoader(manager),
            "Rhino3dm": () => new Rhino3dmLoader(manager),
            "STL": () => new STLLoader(manager),
            "PLY": () => new PLYLoader(manager),
        };

        const creator = loaders[format];
        if (!creator) {
            throw new Error(`不支持的模型格式: ${format}`);
        }

        return creator();
    }

    private addUserDataToModel(
        model: AnyModelData,
    ): void {
        const target = this.getTargetObject(model);
        if (!target) return;

        if (Array.isArray(target)) {
            target.forEach(t => {
                t.userData.canChoose = true;
            })
        } else {
            target.userData.canChoose = true;
        }
    }

    private getTargetObject(model: AnyModelData): THREE.Object3D[] | THREE.BufferGeometry | null {
        const children: THREE.Object3D[] = [];

        if (model && typeof model === 'object' && 'scene' in model) {
            const sceneModel = model as { scene: THREE.Object3D };
            sceneModel.scene.traverse((child) => {
                children.push(child);
            });
            return children;
        }

        if (model && model instanceof THREE.Object3D) {
            model.traverse((child) => {
                children.push(child);
            });
            return children;
        }

        if (model && model instanceof THREE.BufferGeometry) {
            return model;
        }

        return null;
    }

    public load(
        url: string,
        onLoad: (object: ModelData<T>) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (err: unknown) => void
    ): void {
        this.loader.load(
            url,
            (object) => {
                this.addUserDataToModel(object);
                onLoad(object as ModelData<T>);
            },
            onProgress,
            onError
        );
    }

    public async loadAsync(url: string): Promise<ModelData<T>> {
        return new Promise((resolve, reject) => {
            this.load(
                url,
                (object) => resolve(object),
                undefined,
                (error) => reject(error),
            );
        });
    }

    public get Format(): T {
        return this.format;
    }
}