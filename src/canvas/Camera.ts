import { Rectangle } from "./shapes/Rectangle"
import { Inputs } from "../controls/Inputs"
import {
    INITIAL_VIEWPORT_HEIGHT,
    INITIAL_VIEWPORT_WIDTH,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "../utils/constants"
import { Item } from "../world/items/Item"
import {
    minmax,
    withEvents
} from "../utils"


export class Camera extends withEvents(Rectangle) {

    public renderScale: number = 1
    private renderWidth: number = INITIAL_VIEWPORT_WIDTH
    private renderHeight: number = INITIAL_VIEWPORT_HEIGHT

    constructor() {
        super(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, INITIAL_VIEWPORT_WIDTH, INITIAL_VIEWPORT_HEIGHT)
    }

    update(inputs: Inputs): void {
        this.move(inputs.direction.x * 30, inputs.direction.y * 30)
    }

    track(item: Item): void {
        let head = item.mainShape.head
        this.moveTo(head.x, head.y)
    }

    resize(newWidth: number, newHeight: number): void {
        this.renderWidth = newWidth
        this.renderHeight = newHeight
        this.scaleTo(this.renderScale)
    }

    move(dx: number, dy: number): Camera {
        return this.moveTo(this.x + dx, this.y + dy)
    }

    moveTo(x: number, y: number): Camera {
        this.x = x
        this.y = y
        this.updateBorders()
        this.dispatchEvent(new Event("updated"))
        return this
    }

    asRectangle(): Rectangle {
        return new Rectangle(this.x, this.y, this.width, this.height)
    }

    scale(ratio: number): Camera {
        return this.scaleTo(this.renderScale * ratio)
    }

    zoomIn() {
        this.scaleTo(this.renderScale * 0.9)
    }

    zoomOut() {
        this.scaleTo(this.renderScale * 1.1)
    }

    scaleTo(zoom: number): Camera {
        this.renderScale = minmax(0.5, zoom, 6)
        this.width = this.renderWidth * this.renderScale
        this.height = this.renderHeight * this.renderScale
        this.updateBorders()

        console.log(this.renderWidth, this.renderScale, this.width)
        this.dispatchEvent(new Event("updated"))
        return this
    }
}
