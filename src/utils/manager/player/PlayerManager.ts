import * as THREE from "three";

import {FirstPersonCameraController} from "~/utils/manager/player/controller/FirstPersonCameraController.ts";
import {PlayerBase} from "~/utils/manager/player/PlayerBase.ts";
import {PlayerMoveController} from "~/utils/manager/player/controller/PlayerMoveController.ts";
import {EventManager} from "~/utils/manager/EventManager.ts";
import {PlayerInputController} from "~/utils/manager/player/controller/PlayerInputController.ts";
import {SceneManager} from "~/utils/manager/scene/SceneManager.ts";

export class PlayerManager {
    private readonly sceneManager: SceneManager;
    private readonly player: PlayerBase;
    private readonly FirstPersonCameraController: FirstPersonCameraController;
    private readonly PlayerMoveController: PlayerMoveController;
    private readonly PlayerInputController: PlayerInputController;
    private readonly EventManager: EventManager;

    constructor(sceneManager: SceneManager, eventManager: EventManager) {
        this.sceneManager = sceneManager;
        this.player = new PlayerBase("Player", new THREE.Vector3(0, 0, 0))
        this.FirstPersonCameraController = new FirstPersonCameraController(this.player);
        this.PlayerMoveController = new PlayerMoveController(this.player);
        this.PlayerInputController = new PlayerInputController(this.sceneManager, this.PlayerMoveController, this.FirstPersonCameraController);
        this.EventManager = eventManager;
    }

    public update(): void {
        this.FirstPersonCameraController.update();
        this.PlayerInputController.update();
    }

    public async bindWindowEvent(): Promise<void> {
        this.EventManager.addFunction('mousedown', async (e: MouseEvent) => {
            await this.PlayerInputController.mousedown(e)
        })

        this.EventManager.addFunction('mousemove', (e: MouseEvent) => {
            this.PlayerInputController.mousemove(e)
        })

        this.EventManager.addFunction('mouseup', (e: MouseEvent) => {
            this.PlayerInputController.mouseup(e)
        })

        this.EventManager.addFunction('keyup', (e: KeyboardEvent) => {
            this.PlayerInputController.keyup(e)
        })

        this.EventManager.addFunction('keydown', (e: KeyboardEvent) => {
            this.PlayerInputController.keydown(e)
        })

        this.EventManager.Listen()
    }

    public get Player() {
        return this.player;
    }
}