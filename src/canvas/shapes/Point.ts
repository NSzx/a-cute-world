import {
    CircleProperties,
    PointProperties,
    RectangleProperties,
    WithCoordinates,
    WithIntersections
} from "./index"
import { Vector } from "../../physics/Vector"


export class Point extends PointProperties {

    static from(coordinates: WithCoordinates): Point {
        return new Point(coordinates.x, coordinates.y)
    }

    constructor(public x: number,
                public y: number) {
        super()
    }

    intersect(other: WithIntersections): boolean {
        if (other instanceof CircleProperties) {
            const dx = this.x - other.x
            const dy = this.y - other.y
            return Math.sqrt(dx * dx + dy * dy) < other.radius
        }
        if (other instanceof RectangleProperties) {
            return this.x >= other.left && this.x <= other.right
                   && this.y >= other.top && this.y <= other.bottom
        }
        return other.intersect(this)
    }

    applyVector(vector: Vector): Point {
        return this.move(vector.x, vector.y)
    }

    move(dx: number, dy: number): Point {
        return new Point(this.x + dx, this.y + dy)
    }

    moveTo(x: number, y: number): Point {
        return new Point(x, y)
    }

}
