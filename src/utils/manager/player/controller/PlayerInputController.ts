import {PlayerMoveController} from "~/utils/manager/player/controller/PlayerMoveController.ts";
import {FirstPersonCameraController} from "~/utils/manager/player/controller/FirstPersonCameraController.ts"
import {SceneManager} from "~/utils/manager/scene/SceneManager.ts";

export class PlayerInputController {
    public static INPUT_MAP = {
        keyboard: {
            forward: 'KeyW',
            backward: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
            up: 'Space',
            down: 'ShiftLeft'
        },
        mouse: {
            choose: 1,
            lifted: 1,
            alt: {}
        }
    }

    private boardKeysPressed: Set<string> = new Set();
    private readonly sceneManager: SceneManager;
    private readonly PlayerMoveController: PlayerMoveController;
    private readonly FirstPersonCameraController: FirstPersonCameraController;

    constructor(sceneManager: SceneManager, playerMoveController: PlayerMoveController, firstPersonCameraController: FirstPersonCameraController) {
        this.sceneManager = sceneManager;
        this.PlayerMoveController = playerMoveController;
        this.FirstPersonCameraController = firstPersonCameraController;
    }

    public update() {
        const forward = this.boardKeysPressed.has(PlayerInputController.INPUT_MAP.keyboard.forward);
        const backward = this.boardKeysPressed.has(PlayerInputController.INPUT_MAP.keyboard.backward);
        const left = this.boardKeysPressed.has(PlayerInputController.INPUT_MAP.keyboard.left);
        const right = this.boardKeysPressed.has(PlayerInputController.INPUT_MAP.keyboard.right);
        const up = this.boardKeysPressed.has(PlayerInputController.INPUT_MAP.keyboard.up);
        const down = this.boardKeysPressed.has(PlayerInputController.INPUT_MAP.keyboard.down);
        this.PlayerMoveController.handleMovement(
            forward,
            backward,
            left,
            right,
            up,
            down,
        )
    }

    public async mousedown(e: MouseEvent) {
        switch (e.button) {
            case PlayerInputController.INPUT_MAP.mouse.lifted:
                if (e.target != this.sceneManager.Renderer.domElement) return;
                await this.sceneManager.Renderer.domElement.requestPointerLock()
                break;
        }
    }

    public mousemove(e: MouseEvent) {
        if (document.pointerLockElement === this.sceneManager.Renderer.domElement)
            this.FirstPersonCameraController.handleOrientationInput(e.movementX, e.movementY)
    }

    public mouseup(e: MouseEvent) {
        switch (e.button) {
            case PlayerInputController.INPUT_MAP.mouse.lifted:
                document.exitPointerLock = document.exitPointerLock ||
                    (document as typeof document & {
                        mozExitPointerLock: () => Promise<void>
                    }).mozExitPointerLock ||
                    (document as typeof document & {
                        webkitExitPointerLock: () => Promise<void>
                    }).webkitExitPointerLock;

                if (document.exitPointerLock) {
                    document.exitPointerLock();
                }
                break;
        }
    }

    public keydown(e: KeyboardEvent) {
        this.boardKeysPressed.add(e.code)
    }

    public keyup(e: KeyboardEvent) {
        this.boardKeysPressed.delete(e.code)
    }
}
