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

    applyVector(vector: Vector): WithIntersections {
        return this
    }

    intersect(other: WithIntersections): boolean {
        return this.shapes.some(shape => shape.intersect(other))
    }

    move(dx: number, dy: number): WithIntersections {
        return this
    }

    moveTo(x: number, y: number): WithIntersections {
        return this
    }
}
