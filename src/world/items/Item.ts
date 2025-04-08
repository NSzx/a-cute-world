import { WeatherConditions } from "../Weather"
import {
    WithCoordinates,
    WithIntersections
} from "../../canvas/shapes"
import { CanvasHelper } from "../../canvas/CanvasHelper"
import { Shape } from "../../canvas/shapes/Shape"
import { Inputs } from "../../controls/Inputs"
import { Vector } from "../../physics/Vector"


export abstract class Item implements WithIntersections {

    public shapes: Shape[] = []

    public anchors: (() => WithCoordinates)[] = []

    abstract update(weather: WeatherConditions, inputs?: Inputs): void

    abstract draw(helper: CanvasHelper): void

    get mainShape(): Shape {
        return this.shapes[0]
    }

    intersect(other: WithIntersections): boolean {
        return this.shapes.some(shape => shape.intersect(other))
    }

    translate(dx: number, dy: number) {
        this.shapes = this.shapes.map(s => s.translate(dx, dy))
        return this
    }

    move(dx: number, dy: number) {
        return this.translate(dx, dy)
    }

    moveTo(x: number, y: number) {
        const translation = Vector.ab(this.mainShape.head, { x, y })
        return this.translate(translation.x, translation.y)
    }
}
