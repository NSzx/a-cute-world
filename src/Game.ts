import { CanvasHelper } from "./canvas/CanvasHelper"
import {
    FPS,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "./utils/constants"
import { World } from "./world/World"
import {
    Inputs,
    InputsReader
} from "./controls/Inputs"
import { Item } from "./world/items/Item"
import { HUD } from "./hud/HUD"
import { distance } from "./canvas/shapes"
import { Camera } from "./canvas/Camera"

export class Game {

    readonly canvas: HTMLCanvasElement
    readonly fpsInterval: number
    readonly camera: Camera
    readonly helper: CanvasHelper
    readonly inputsReader: InputsReader
    readonly world: World
    readonly hud: HUD

    controlledItem?: Item
    trackedItem?: Item

    paused = true

    constructor(public readonly container: HTMLElement) {
        this.canvas = document.createElement("canvas")
        this.fpsInterval = 1000 / FPS
        this.camera = new Camera()
        this.helper = new CanvasHelper(this.canvas.getContext("2d")!, this.camera)
        this.inputsReader = new InputsReader(container)
        this.world = new World(WORLD_WIDTH, WORLD_HEIGHT)
        this.hud = new HUD()
        this.setupContainer(container)
    }

    private onContainerResize: ResizeObserverCallback = ([ container ]) => {
        this.canvas.height = container.contentRect.height
        this.canvas.width = container.contentRect.width
        this.camera.resize(container.contentRect.width, container.contentRect.height)
    }

    private setupContainer(container: HTMLElement) {
        container.style.overflow = "hidden"
        container.style.position = "absolute"
        container.style.inset = "0"
        container.append(this.canvas)
        const ro = new ResizeObserver(this.onContainerResize)
        ro.observe(container)
    }

    private lastTick = 0
    private runGameLoop = () => {
        requestAnimationFrame(this.runGameLoop)

        const currentTick = performance.now()
        const elapsed = currentTick - this.lastTick
        if (elapsed > this.fpsInterval) {
            this.lastTick = currentTick - (elapsed % this.fpsInterval)
            let inputs: Inputs = this.inputsReader.getCurrentInputs()

            this.handleInputs(inputs)

            if (!this.paused) {
                this.world.update(inputs, this.controlledItem)
                if (this.controlledItem == undefined && this.trackedItem == undefined) {
                    this.camera.update(inputs)
                } else {
                    this.camera.track((this.controlledItem ?? this.trackedItem)!)
                }
                this.world.wrapItems(this.camera)
            }
            this.world.draw(this.helper, this.camera)
            this.hud.draw(this.helper, this.camera, inputs)
        }
    }

    private handleInputs(inputs: Inputs): void {
        if (inputs.keysDown.has("escape")) {
            this.paused = !this.paused
            this.hud.setPaused(this.paused)
        }
        if (!this.paused) {
            if (inputs.keysDown.has("c")) {
                if (this.controlledItem == undefined) {
                    this.controlledItem = this.getClosestCreature()
                    this.trackedItem = undefined
                } else {
                    this.controlledItem = undefined
                }
                this.hud.updateControls(this.controlledItem, this.trackedItem)
            }
            if (inputs.keysDown.has("t")) {
                if (this.trackedItem == undefined) {
                    this.controlledItem = undefined
                    this.trackedItem = this.getClosestCreature()
                } else {
                    this.trackedItem = undefined
                }
                this.hud.updateControls(this.controlledItem, this.trackedItem)
            }
            if (inputs.keysDown.has("arrowup")) {
                this.camera.zoomIn()
            }
            if (inputs.keysDown.has("arrowdown")) {
                this.camera.zoomOut()
            }
        }
    }

    private getClosestCreature(): Item | undefined {
        let closestCreature: Item | undefined
        let closestDistance = Number.POSITIVE_INFINITY
        for (let creature of this.world.creatures) {
            let challenge = distance(this.camera, creature.mainShape.head)
            if (challenge < closestDistance) {
                closestCreature = creature
                closestDistance = challenge
            }
        }
        return closestCreature
    }

    start() {
        this.runGameLoop()
        this.container.focus()
    }
}
