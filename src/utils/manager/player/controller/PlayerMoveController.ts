import * as THREE from "three";
import type {PlayerBase} from "~/utils/manager/player/PlayerBase.ts";

const MOVEMENT_CONFIG = {
    MOVE_SPEED: 0.1,
    DAMPING: 0.5,
};

export class PlayerMoveController {
    private readonly player: PlayerBase;
    private readonly inputVector = new THREE.Vector3();
    private readonly rotationAxis = new THREE.Vector3(0, 1, 0);

    constructor(player: PlayerBase) {
        this.player = player;
    }

    public handleMovement(
        forward: boolean,
        backward: boolean,
        left: boolean,
        right: boolean,
        up: boolean,
        down: boolean
    ): void {
        this.calculateMovementVector(forward, backward, left, right, up, down);
        this.applyDamping();
        this.applyMovement();
    }

    private calculateMovementVector(
        forward: boolean,
        backward: boolean,
        left: boolean,
        right: boolean,
        up: boolean,
        down: boolean
    ): void {
        // 根据按键计算原始方向向量
        this.inputVector.set(
            Number(right) - Number(left),
            Number(up) - Number(down),
            Number(backward) - Number(forward)
        );

        // 标准化并应用朝向旋转
        if (this.inputVector.lengthSq() > 0) {
            this.inputVector.normalize();
            this.inputVector.applyAxisAngle(this.rotationAxis, this.player.Rotation.y);
        }
    }

    private applyDamping(): void {
        const {DAMPING} = MOVEMENT_CONFIG;
        this.player.Velocity.multiplyScalar(1 - DAMPING);
    }

    private applyMovement(): void {
        const {MOVE_SPEED} = MOVEMENT_CONFIG;
        this.player.Velocity.addScaledVector(this.inputVector, MOVE_SPEED);
        this.player.Location.add(this.player.Velocity);
    }
}