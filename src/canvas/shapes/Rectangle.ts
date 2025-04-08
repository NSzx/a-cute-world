import {
    RectangleProperties,
    WithIntersections
} from "./index"
import { Vector } from "../../physics/Vector"


export class Rectangle extends RectangleProperties {

    static fromBorders(left: number, top: number, right: number, bottom: number): Rectangle {
        return new Rectangle((left + right) / 2, (top + bottom) / 2, right - left, bottom - top)
    }

    bottom!: number
    left!: number
    right!: number
    top!: number

    constructor(public x: number,
                public y: number,
                public width: number,
                public height: number) {
        super()
        this.updateBorders()
    }

    protected updateBorders(): void {
        this.left = this.x - this.width / 2
        this.right = this.x + this.width / 2
        this.top = this.y - this.height / 2
        this.bottom = this.y + this.height / 2
    }

    scale(ratio: number) {
        return new Rectangle(
            this.x,
            this.y,
            this.width * ratio,
            this.height * ratio
        )
    }

    applyVector(v: Vector): Rectangle {
        return this.move(v.x, v.y)
    }

    move(dx: number, dy: number): Rectangle {
        return this.moveTo(this.x + dx, this.y + dy)
    }

    moveTo(x: number, y: number): Rectangle {
        return new Rectangle(x, x, this.width, this.height)
    }

    intersect(other: WithIntersections): boolean {
        if (other instanceof RectangleProperties) {
            return !(this.left > other.right ||
                     this.right < other.left ||
                     this.top > other.bottom ||
                     this.bottom < other.top)
        }
        return other.intersect(this)
    }
}
