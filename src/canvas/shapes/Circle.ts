import {
    CircleProperties,
    RectangleProperties,
    WithCoordinates,
    WithIntersections
} from "./index"
import { PI2 } from "../../utils/constants"
import { Vector } from "../../physics/Vector"
import { Point } from "./Point"


export class Circle extends CircleProperties {


    constructor(public x: number,
                public y: number,
                public radius: number,
                public theta: number) {
        super()
    }

    get origin() {
        return Point.from(this)
    }

    get front(): WithCoordinates {
        return this.outerPoint(0)
    }

    get back(): WithCoordinates {
        return this.outerPoint(Math.PI)
    }

    get left(): WithCoordinates {
        return this.outerPoint(PI2)
    }

    get right(): WithCoordinates {
        return this.outerPoint(-PI2)
    }

    outerPoint(angle: number): WithCoordinates {
        return {
            x: this.x + this.radius * Math.cos(this.theta + angle),
            y: this.y + this.radius * Math.sin(this.theta + angle),
        }
    }

    rotateToMatch(vector: Vector): Circle {
        return this.rotateTo(vector.d)
    }

    rotateTo(theta: number): Circle {
        return new Circle(this.x, this.y, this.radius, theta)
    }

    rotate(angle: number, radius?: number): Circle {
        return new Circle(this.x, this.y, radius ?? this.radius, this.theta + angle)
    }

    applyVector(v: Vector, rotate = true): Circle {
        return new Circle(this.x + v.x, this.y + v.y, this.radius, rotate ? v.d : this.theta)
    }

    translate(dx: number, dy: number): Circle {
        return new Circle(this.x + dx, this.y + dy, this.radius, this.theta)
    }

    move(dx: number, dy: number): Circle {
        return new Circle(this.x + dx, this.y + dy, this.radius, Math.atan2(dy, dx))
    }

    moveTo(x: number, y: number): Circle {
        return new Circle(x, y, this.radius, this.theta)
    }

    scale(ratio: number): Circle {
        return new Circle(this.x, this.y, this.radius * ratio, this.theta)
    }

    intersect(other: WithIntersections): boolean {
        if (other instanceof CircleProperties) {
            const dx = this.x - other.x
            const dy = this.y - other.y
            return Math.sqrt(dx * dx + dy * dy) < this.radius + other.radius
        }
        if (other instanceof RectangleProperties) {
            const closestX = (this.x < other.left ? other.left : (this.x > other.right ? other.right : this.x))
            const closestY = (this.y < other.top ? other.top : (this.y > other.bottom ? other.bottom : this.y))
            const dx = closestX - this.x
            const dy = closestY - this.y
            return (dx * dx + dy * dy) <= this.radius * this.radius
        }
        return other.intersect(this)
    }

    chain(distance: number, radius: number, angle: number): Circle {
        let theta = this.theta + angle
        let x = this.x - distance * Math.cos(theta)
        let y = this.y - distance * Math.sin(theta)
        return new Circle(x, y, radius, theta)
    }

    toVector() {
        return Vector.ab(this, this.front)
    }
}
