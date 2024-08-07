

export class Camera {

    readonly canvas: HTMLCanvasElement
    readonly context: CanvasRenderingContext2D
    private readonly fpsInterval: number

    constructor(public x = 0,
                public y = 0,
                public readonly width = 1600,
                public readonly height = 900,
                public readonly fps = 60) {
        this.canvas = document.createElement("canvas")
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d")!
        this.fpsInterval = 1000 / fps
    }

    private lastTick = 0
    draw = () => {
        requestAnimationFrame(this.draw);

        const currentTick = performance.now();
        const elapsed = currentTick - this.lastTick;
        if (elapsed > this.fpsInterval) {
            this.lastTick = currentTick - (elapsed % this.fpsInterval);

        }
    }
}