import * as THREE from "three";

// 玩家对象接口
export interface Player {
    name: string;               // 玩家名称
    moveSpeed: number;          // 移动速度
    rotationalSpeed: number;    // 旋转速度
    location: THREE.Vector3;          // 位置
    rotation: THREE.Vector3;          // 旋转
    velocity: THREE.Vector3;          // 速度
}


export class PlayerBase {
    public player: Player;
    public camera: THREE.PerspectiveCamera;

    constructor(name: string, spawnLocation: THREE.Vector3) {
        this.player = this.initPlayerObj(name, spawnLocation)

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        return this;
    }

    private initPlayerObj(name: string, spawnLocation: THREE.Vector3): Player {
        return {
            name: name,
            moveSpeed: 0.01,
            rotationalSpeed: 0.005,
            location: spawnLocation,
            rotation: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0)
        }
    }

    public get Name() {
        return this.player.name.toString();
    }

    public get Location() {
        return this.player.location;
    }

    public get Rotation() {
        return this.player.rotation;
    }

    public get Velocity() {
        return this.player.velocity;
    }

    public get MoveSpeed() {
        return this.player.moveSpeed;
    }

    public get RotationalSpeed() {
        return this.player.rotationalSpeed;
    }
}