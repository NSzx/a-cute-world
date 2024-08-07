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
    PI2,
    PI4,
    PI6,
    TWOPI,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "../../../../../utils/constants"


export class Snake extends Creature {
    static random(): Snake {
        return new Snake(
            rand(50, WORLD_WIDTH - 50),
            rand(50, WORLD_HEIGHT - 50),
            rand(20, 30),
            Math.round(rand(30, 50)),
            rand(0, TWOPI),
            Math.round(rand(0, 360)),
        )
    }

    v: Vector = Vector.polar(0, 0)
    readonly vMax: number = 200
    readonly maxAngle: number = 0.3
    readonly friction: number = 0.5
    readonly acceleration: number = 10
    readonly windResistance: number = 1


    constructor(x: number,
                y: number,
                public size: number,
                public length: number,
                orientation: number,
                public hue: number) {
        super()
        let head = new Circle(x, y, size, orientation)
        let radii = [ 105, 90, ...new Array(length).fill(70).map(((r, i) => r - i * (70 - 4) / length)) ].map(r => r / 100)
        let chain = [ head ]
        let angle = rand(-0.3, 0.3)
        radii.forEach((r, i) => {
            angle = minmax(-0.3, angle + rand(-0.05, 0.05), 0.3)
            chain.push(chain[i].chain(size / 2, r * size, angle))
        })
        this.shapes = [
            new Shape(chain, 2.4, 0.4)
        ]
    }

    private randomInputs(): Partial<Inputs> {
        let maxChangeAngle: number = PI4 * (0.8 + 1.2 * this.relativeVelocity)
        return {
            direction: Vector.polar(this.lastInputs.direction!.d + rand(-maxChangeAngle, maxChangeAngle), minmax(0.1, this.lastInputs.direction!.m + rand(-0.05, 0.05), 1))
        }
    }

    private lastInputs: Partial<Inputs> = {
        direction: Vector.polar(Math.random() * Math.PI * 2, rand(0.1, 1))
    }

    update(weather: WeatherConditions, inputs?: Partial<Inputs>): void {
        if (inputs == undefined) {
            return this.update(weather, Math.random() < 0.05 ? this.randomInputs() : this.lastInputs)
        }
        this.handlePhysics(weather, inputs.direction!)
        this.shapes = [ this.mainShape.applyVector(this.v) ]

        this.lastInputs = inputs
    }

    draw(helper: CanvasHelper): void {
        helper.draw(this.mainShape, { fillStyle: `hsl(${ this.hue }, 75%, 50%)`, lineWidth: 3, strokeStyle: `hsl(${ this.hue }, 60%, 75%)` })
        let eyesReference = this.mainShape.head.scale(0.8)
        helper.ellipse(eyesReference.left, this.size / 6, this.size / 4, eyesReference.theta + PI6, { fillStyle: "white" })
        helper.ellipse(eyesReference.right, this.size / 6, this.size / 4, eyesReference.theta - PI6, { fillStyle: "white" })

    }
}
