export class EventManager {
    private readonly manifest: Map<keyof WindowEventMap, Array<(event: WindowEventMap[keyof WindowEventMap]) => void>>

    constructor() {
        this.manifest = new Map();
    }

    public addFunction<K extends keyof WindowEventMap>(type: K, fn: (event: WindowEventMap[K]) => void): void {
        if (!this.manifest.has(type)) {
            this.manifest.set(type, [fn as (event: WindowEventMap[keyof WindowEventMap]) => void]);
        } else {
            this.manifest.get(type)?.push(fn as (event: WindowEventMap[keyof WindowEventMap]) => void);
        }
    }

    public removeFunction<K extends keyof WindowEventMap>(type: K, fn: (event: WindowEventMap[K]) => void): void {
        if (this.manifest.has(type)) {
            const functions = this.manifest.get(type);
            if (functions) {
                const index = functions.indexOf(fn as (event: WindowEventMap[keyof WindowEventMap]) => void);
                if (index !== -1) {
                    functions.splice(index, 1);
                }
            }
        }
    }

    public Listen() {
        for (const [type, fns] of this.manifest) {
            window.addEventListener(type, (e) => {
                for (const fn of fns) {
                    fn(e);
                }
            });
        }
    }

    public dispose(): void {
        for (const [type, fns] of this.manifest) {
            window.removeEventListener(type, (e) => {
                for (const fn of fns) {
                    fn(e);
                }
            });
        }
        this.manifest.clear();
    }
}
