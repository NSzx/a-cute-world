import { Creature } from "../Creature"
import { Inputs } from "../../../../../controls/Inputs"
import { Circle } from "../../../../../canvas/shapes/Circle"
import { Shape } from "../../../../../canvas/shapes/Shape"
import { WeatherConditions } from "../../../../Weather"
import { CanvasHelper } from "../../../../../canvas/CanvasHelper"
import {
    minmax,
    rand
} from "utils"
import { Vector } from "../../../../../physics/Vector"
import {
    PI12,
    PI4,
    PI6,
    TWOPI,
    TWOPI3,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "../../../../../utils/constants"
import { ShapeStyles } from "../../../../../canvas"


export class Fly extends Creature {

    static random(): Fly {
        return new Fly(
            rand(50, WORLD_WIDTH - 50),
            rand(50, WORLD_HEIGHT - 50),
            rand(3, 6),
            rand(0, TWOPI),
        )
    }

    v: Vector = Vector.polar(0, 0)
    readonly vMax: number = 200
    readonly maxDirectionAngle: number = 5 * PI6
    readonly friction: number = 0.7
    readonly acceleration: number = 20
    readonly windResistance: number = 1

    constructor(x: number, y: number, public readonly size: number, orientation: number) {
        super()
        let head = new Circle(x, y, size, orientation)
        let body = head.chain(size * 1.7, size * 1.5, 0)
        this.shapes = [
            new Shape([
                head,
                body,
            ], PI12, 0.55)
        ]
    }

    private randomInputs(): Partial<Inputs> {
        return {
            direction: Vector.polar(Math.random() * Math.PI * 2, minmax(0, this.lastInputs.direction!.m + rand(-0.25, 0.25), 1))
        }
    }

    private lastInputs: Partial<Inputs> = {
        direction: Vector.polar(Math.random() * Math.PI * 2, 1)
    }

    update(weather: WeatherConditions, inputs?: Partial<Inputs>): void {
        if (inputs == undefined) {
            return this.update(weather, Math.random() < 0.05 ? this.randomInputs() : this.lastInputs)
        }
        this.handlePhysics(weather, inputs.direction!)
        this.shapes = [ this.mainShape.applyVector(this.v) ]

        this.lastInputs = inputs
        this.wingAnimationTimer = this.v.m < 1 ? 3 : (this.wingAnimationTimer + .3 + .7 * this.v.m / this.realVMax) % 4
    }

    private readonly eyesStyles: ShapeStyles = { fillStyle: "firebrick", lineWidth: 2, strokeStyle: "black" }

    private readonly eyesSize: number = this.size * 0.7

    private readonly wingsStyles: ShapeStyles = {
        fillStyle: "rgba(255,255,255,.6)",
        strokeStyle: "white",
        lineWidth: 2,
    }

    private wingAnimationTimer = 3

    draw(helper: CanvasHelper): void {
        helper.draw(this.mainShape, { fillStyle: "black" })
        helper.point(this.mainShape.head.outerPoint(PI4), this.eyesSize, this.eyesStyles)
        helper.point(this.mainShape.head.outerPoint(-PI4), this.eyesSize, this.eyesStyles)
        let body = this.mainShape.chain[1]
        let wingsWidth: number = this.size * (0.7 + 0.2 * this.wingAnimationTimer)
        helper.ellipse(body.outerPoint(TWOPI3), this.size * 2, wingsWidth, body.theta + 3.5 * PI4, this.wingsStyles)
        helper.ellipse(body.outerPoint(-TWOPI3), this.size * 2, wingsWidth, body.theta - 3.5 * PI4, this.wingsStyles)
    }
}
