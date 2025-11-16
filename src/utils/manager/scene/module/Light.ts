import * as THREE from "three";

export type LightType = 'ambient' | 'directional';

export interface AmbientLightConfig {
    color: number;
    intensity: number;
}

export interface DirectionalLightConfig {
    color: number;
    intensity: number;
    castShadow: boolean;
    shadow: {
        mapSize: {
            width: number;
            height: number;
        };
        camera: {
            near: number;
            far: number;
            left: number;
            right: number;
            top: number;
            bottom: number;
        };
    };
    position?: {
        x: number;
        y: number;
        z: number;
    };
}

export class Light {
    public readonly DefaultAmbientLightConfig: AmbientLightConfig = {
        color: 0x404040,
        intensity: 1.5,
    };

    public readonly DefaultDirectionalLightConfig: DirectionalLightConfig = {
        color: 0xffffff,
        intensity: 1,
        castShadow: true,
        shadow: {
            mapSize: {
                width: 4096,
                height: 4096
            },
            camera: {
                near: 0.5,
                far: 500,
                left: -100,
                right: 100,
                top: 100,
                bottom: -100,
            }
        },
        position: {
            x: 10,
            y: 10,
            z: 10
        }
    };

    private readonly _lightObject: THREE.AmbientLight | THREE.DirectionalLight;
    private readonly _type: LightType;
    private _config: AmbientLightConfig | DirectionalLightConfig;

    constructor(type: LightType, config?: AmbientLightConfig | DirectionalLightConfig) {
        this._type = type;

        if (config) {
            this._config = {...config};
        } else {
            this._config = type === 'ambient'
                ? {...this.DefaultAmbientLightConfig}
                : {...this.DefaultDirectionalLightConfig};
        }

        if (type === 'ambient') {
            const ambientConfig = this._config as AmbientLightConfig;
            this._lightObject = new THREE.AmbientLight(ambientConfig.color, ambientConfig.intensity);
        } else {
            const directionalConfig = this._config as DirectionalLightConfig;
            this._lightObject = new THREE.DirectionalLight(directionalConfig.color, directionalConfig.intensity);

            if (directionalConfig.position) {
                this._lightObject.position.set(
                    directionalConfig.position.x,
                    directionalConfig.position.y,
                    directionalConfig.position.z
                );
            }

            this.updateDirectionalLightShadow();
        }
    }

    public get type(): LightType {
        return this._type;
    }

    public get lightObject(): THREE.AmbientLight | THREE.DirectionalLight {
        return this._lightObject;
    }

    public get config(): AmbientLightConfig | DirectionalLightConfig {
        return {...this._config};
    }

    public updateConfig(newConfig: Partial<AmbientLightConfig | DirectionalLightConfig>): void {
        this._config = {...this._config, ...newConfig};

        this.updateLightProperties();
    }

    public setAmbientConfig(config: AmbientLightConfig): void {
        if (this._type !== 'ambient') {
            throw new Error('Cannot set ambient config on a directional light');
        }
        this.updateConfig(config);
    }

    public setDirectionalConfig(config: DirectionalLightConfig): void {
        if (this._type !== 'directional') {
            throw new Error('Cannot set directional config on an ambient light');
        }
        this.updateConfig(config);
    }

    private updateLightProperties(): void {
        if (this._type === 'ambient') {
            this.updateAmbientLight();
        } else {
            this.updateDirectionalLight();
        }
    }

    private updateAmbientLight(): void {
        const config = this._config as AmbientLightConfig;
        const light = this._lightObject as THREE.AmbientLight;

        light.color = new THREE.Color(config.color);
        light.intensity = config.intensity;
    }

    private updateDirectionalLight(): void {
        const config = this._config as DirectionalLightConfig;
        const light = this._lightObject as THREE.DirectionalLight;

        light.color = new THREE.Color(config.color);
        light.intensity = config.intensity;

        if (config.position) {
            light.position.set(config.position.x, config.position.y, config.position.z);
        }

        this.updateDirectionalLightShadow();
    }

    private updateDirectionalLightShadow(): void {
        if (this._type !== 'directional') return;

        const config = this._config as DirectionalLightConfig;
        const light = this._lightObject as THREE.DirectionalLight;

        light.castShadow = config.castShadow;

        if (config.castShadow) {
            light.shadow.mapSize.width = config.shadow.mapSize.width;
            light.shadow.mapSize.height = config.shadow.mapSize.height;

            light.shadow.camera.near = config.shadow.camera.near;
            light.shadow.camera.far = config.shadow.camera.far;
            light.shadow.camera.left = config.shadow.camera.left;
            light.shadow.camera.right = config.shadow.camera.right;
            light.shadow.camera.top = config.shadow.camera.top;
            light.shadow.camera.bottom = config.shadow.camera.bottom;

            light.shadow.camera.updateProjectionMatrix();

            light.shadow.map = null as any;
        }
    }

    public setPosition(x: number, y: number, z: number): void {
        if (this._type !== 'directional') {
            console.warn('Position can only be set on directional lights');
            return;
        }

        this._lightObject.position.set(x, y, z);

        const config = this._config as DirectionalLightConfig;
        if (!config.position) {
            (this._config as DirectionalLightConfig).position = {x, y, z};
        } else {
            config.position.x = x;
            config.position.y = y;
            config.position.z = z;
        }
    }

    public getPosition(): THREE.Vector3 {
        return this._lightObject.position.clone();
    }

    public dispose(): void {
        if (this._type === 'directional') {
            const light = this._lightObject as THREE.DirectionalLight;
            if (light.shadow.map) {
                light.shadow.map.dispose();
            }
        }
    }
}