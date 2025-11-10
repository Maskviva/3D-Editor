import type {PlayerBase} from "~/utils/manager/player/PlayerBase.ts";
import * as THREE from "three"

export class FirstPersonCameraController {
    private static readonly DEFAULT_PLAYER_HEIGHT = 1;
    private static readonly PITCH_LIMIT = Math.PI / 2 - 0.1;

    private readonly _player: PlayerBase;
    private _cameraPitch: number = 0;

    constructor(player: PlayerBase) {
        this._player = player;
        this._initializeCamera();
    }

    public handleOrientationInput(movementX: number, movementY: number): void {
        const rotationalSpeed = this._player.RotationalSpeed;

        // 更新水平旋转（偏航角）
        this._player.Rotation.y -= movementX * rotationalSpeed;

        // 更新垂直旋转（俯仰角）并限制范围
        this._cameraPitch = this.Clamp(
            this._cameraPitch - movementY * rotationalSpeed,
            -FirstPersonCameraController.PITCH_LIMIT,
            FirstPersonCameraController.PITCH_LIMIT
        );
    }

    public update(): void {
        const playerPosition = this._player.Location;
        const eyeHeight = playerPosition.y + FirstPersonCameraController.DEFAULT_PLAYER_HEIGHT * 0.9;

        // 更新相机位置和旋转
        this._updateCameraTransform(playerPosition, eyeHeight);
    }

    private _initializeCamera(): void {
        // 可选的相机初始化逻辑
        this._player.camera.rotation.order = "YXZ"; // 确保正确的旋转顺序
    }

    private _updateCameraTransform(playerPosition: THREE.Vector3, eyeHeight: number): void {
        const camera = this._player.camera;

        // 设置相机位置
        camera.position.set(
            playerPosition.x,
            playerPosition.y + eyeHeight,
            playerPosition.z
        );

        // 直接设置旋转
        camera.rotation.y = this._player.Rotation.y;
        camera.rotation.x = this._cameraPitch;
    }

    private Clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    };


    public get pitch(): number {
        return this._cameraPitch;
    }

    public get player(): PlayerBase {
        return this._player;
    }
}
