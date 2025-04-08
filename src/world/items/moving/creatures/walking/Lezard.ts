import { Creature } from "../Creature"
import { Inputs } from "../../../../../controls/Inputs"
import { Circle } from "../../../../../canvas/shapes/Circle"
import { Shape } from "../../../../../canvas/shapes/Shape"
import { WeatherConditions } from "../../../../Weather"
import { CanvasHelper } from "../../../../../canvas/CanvasHelper"
import {
    last,
    minmax,
    rand
} from "utils"
import { Vector } from "../../../../../physics/Vector"
import {
    PI12,
    PI2,
    PI3,
    PI4,
    PI6,
    TWOPI,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "../../../../../utils/constants"
import { ShapeStyles } from "../../../../../canvas"
import {
    distance,
    WithCoordinates
} from "../../../../../canvas/shapes"


export class Lezard extends Creature {
    static random(): Lezard {
        return new Lezard(
            rand(50, WORLD_WIDTH - 50),
            rand(50, WORLD_HEIGHT - 50),
            rand(13, 20),
            rand(0, TWOPI),
            Math.round(rand(0, 360)),
        )
    }

    v: Vector = Vector.polar(0, 0)
    readonly vMax: number
    readonly maxDirectionAngle: number = PI4
    readonly friction: number = 0.6
    readonly acceleration: number = 10
    readonly windResistance: number = 1

    readonly bodyStyles: ShapeStyles
    readonly limbsWidth: number
    readonly limbsLength: number

    constructor(x: number,
                y: number,
                public size: number,
                orientation: number,
                public hue: number) {
        super()
        this.vMax = 11 + 3 * (Math.abs(this.hue - 180) / 180) // Red lezards are fast 👀
        this.bodyStyles = { fillStyle: `hsl(${ this.hue }, 75%, 50%)`, lineWidth: 3, strokeStyle: `hsl(${ this.hue }, 60%, 75%)` }
        this.limbsWidth = this.size * .25
        this.limbsLength = this.size * .6
        this.initBody(x, y, orientation)
    }


    private initBody(x: number, y: number, orientation: number): void {
        const head = new Circle(x, y, this.size, orientation)
        this.shapes = [
            new Shape(
                [ 105, 90, 60, 55, 80, 105, 120, 130, 133, 133, 130, 120, 110, 90, 70, 50, 35, 28, 24, 20, 18, 16, 14, 12 ]
                    .map((r) => r / 100)
                    .reduce((chain, r) => {
                        chain.push(last(chain).chain(this.size / 2, r * this.size, 0))
                        return chain
                    }, [ head ]),
                [ 0, PI12, PI12, PI6, PI6, PI12, PI12, PI12, PI12, PI12, PI12, PI12, PI12, PI12, PI6, PI6, PI6, PI6, PI6, PI6, PI6, PI6, PI6, PI6, PI6 ]
            ),
        ]

        const leftArmAnchor = this.leftArmAnchor
        const leftShoulder = leftArmAnchor.chain(this.shoulders.radius, this.limbsWidth, 0)
        const leftElbow = leftShoulder.chain(this.limbsLength, this.limbsWidth, 0)
        this.leftArm = new Shape(
            [ leftArmAnchor, leftShoulder, leftElbow, leftElbow.chain(this.limbsLength, this.limbsWidth, -PI4) ],
            [ PI12, PI2, { minAngle: -Math.PI, maxAngle: -PI12 }, PI2 ]
        )
        this.leftArmTarget = last(this.leftArm.chain)

        const rightArmAnchor = this.rightArmAnchor
        const rightShoulder = rightArmAnchor.chain(this.shoulders.radius, this.limbsWidth, 0)
        const rightElbow = rightShoulder.chain(this.limbsLength, this.limbsWidth, 0)
        this.rightArm = new Shape(
            [ rightArmAnchor, rightShoulder, rightElbow, rightElbow.chain(this.limbsLength, this.limbsWidth, PI4) ],
            [ PI12, PI2, { minAngle: PI12, maxAngle: Math.PI }, PI2 ]
        )
        this.rightArmTarget = last(this.rightArm.chain)


        const leftLegAnchor = this.leftLegAnchor
        const leftHip = leftLegAnchor.chain(this.shoulders.radius, this.limbsWidth, 0)
        const leftKnee = leftHip.chain(this.limbsLength, this.limbsWidth, 0)
        this.leftLeg = new Shape(
            [ leftLegAnchor, leftHip, leftKnee, leftKnee.chain(this.limbsLength, this.limbsWidth, PI4) ],
            [ PI12, PI2, { minAngle: 0, maxAngle: Math.PI }, PI2 ]
        )
        this.leftLegTarget = last(this.leftLeg.chain)

        const rightLegAnchor = this.rightLegAnchor
        const rightHip = rightLegAnchor.chain(this.shoulders.radius, this.limbsWidth, 0)
        const rightKnee = rightHip.chain(this.limbsLength, this.limbsWidth, 0)
        this.rightLeg = new Shape(
            [ rightLegAnchor, rightHip, rightKnee, rightKnee.chain(this.limbsLength, this.limbsWidth, -PI4) ],
            [ PI12, PI2, { minAngle: -Math.PI, maxAngle: 0 }, PI2 ]
        )
        this.rightLegTarget = last(this.rightLeg.chain)
    }

    get shoulders() {
        return this.mainShape.chain[6]
    }

    get leftArmAnchor() {
        return this.shoulders.rotate(-PI2, this.limbsWidth)
    }

    get rightArmAnchor() {
        return this.shoulders.rotate(PI2, this.limbsWidth)
    }

    get leftLegAnchor() {
        return this.hips.rotate(-PI2, this.limbsWidth)
    }

    get rightLegAnchor() {
        return this.hips.rotate(PI2, this.limbsWidth)
    }

    get hips() {
        return this.mainShape.chain[13]
    }

    get leftArm() {
        return this.shapes[1]
    }

    set leftArm(s: Shape) {
        this.shapes[1] = s
    }

    get rightArm() {
        return this.shapes[2]
    }

    set rightArm(s: Shape) {
        this.shapes[2] = s
    }

    get leftLeg() {
        return this.shapes[3]
    }

    set leftLeg(s: Shape) {
        this.shapes[3] = s
    }

    get rightLeg() {
        return this.shapes[4]
    }

    set rightLeg(s: Shape) {
        this.shapes[4] = s
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

    leftArmTarget!: WithCoordinates
    rightArmTarget!: WithCoordinates
    leftLegTarget!: WithCoordinates
    rightLegTarget!: WithCoordinates

    update(weather: WeatherConditions, inputs?: Partial<Inputs>): void {
        if (inputs == undefined) {
            return this.update(weather, Math.random() < 0.05 ? this.randomInputs() : this.lastInputs)
        }
        this.handlePhysics(weather, inputs.direction!)
        this.shapes[0] = this.mainShape.applyVector(this.v)

        const leftArmAnchor = this.leftArmAnchor
        this.leftArm = this.leftArm.fabrik(leftArmAnchor, this.leftArmTarget)
        const newLeftArmTarget = this.shoulders.applyVector(Vector.ab(this.shoulders, this.shoulders.outerPoint(PI4)).multiply(2))
        this.leftArmTarget = distance(this.leftArmTarget, newLeftArmTarget) > this.limbsLength * (4 + rand(0, .4)) ? newLeftArmTarget : this.leftArmTarget

        const rightArmAnchor = this.rightArmAnchor
        this.rightArm = this.rightArm.fabrik(rightArmAnchor, this.rightArmTarget)
        const newRightArmTarget = this.shoulders.applyVector(Vector.ab(this.shoulders, this.shoulders.outerPoint(-PI4)).multiply(2))
        this.rightArmTarget = distance(this.rightArmTarget, newRightArmTarget) > this.limbsLength * (4 + rand(0, .4)) ? newRightArmTarget : this.rightArmTarget

        const leftLegAnchor = this.leftLegAnchor
        this.leftLeg = this.leftLeg.fabrik(leftLegAnchor, this.leftLegTarget)
        const newLeftLegTarget = this.hips.applyVector(Vector.ab(this.hips, this.hips.outerPoint(PI3)).multiply(1.8))
        this.leftLegTarget = distance(this.leftLegTarget, newLeftLegTarget) > this.limbsLength * (4 + rand(0, .4)) ? newLeftLegTarget : this.leftLegTarget

        const rightLegAnchor = this.rightLegAnchor
        this.rightLeg = this.rightLeg.fabrik(rightLegAnchor, this.rightLegTarget)
        const newRightLegTarget = this.hips.applyVector(Vector.ab(this.hips, this.hips.outerPoint(-PI3)).multiply(1.8))
        this.rightLegTarget = distance(this.rightLegTarget, newRightLegTarget) > this.limbsLength * (4 + rand(0, .4)) ? newRightLegTarget : this.rightLegTarget


        this.lastInputs = inputs
    }

    draw(helper: CanvasHelper): void {
        helper.draw(this.leftArm, this.bodyStyles)
        // helper.point(this.leftArmTarget, this.size / 10, { fillStyle: "grey" })
        helper.draw(this.rightArm, this.bodyStyles)
        // helper.point(this.rightArmTarget, this.size / 10, { fillStyle: "grey" })
        helper.draw(this.leftLeg, this.bodyStyles)
        // helper.point(this.leftLegTarget, this.size / 10, { fillStyle: "grey" })
        helper.draw(this.rightLeg, this.bodyStyles)
        // helper.point(this.rightLegTarget, this.size / 10, { fillStyle: "grey" })
        helper.draw(this.mainShape, this.bodyStyles)
        let eyesReference = this.mainShape.head.scale(0.8)
        helper.point(eyesReference.left, this.size / 6, { fillStyle: "white" })
        helper.point(eyesReference.right, this.size / 6, { fillStyle: "white" })
        // helper.text(`${ this.v.m }`, this.mainShape.head)
        // helper.text(`${ this.hue } ${ Math.round(this.v.m * 10 / 10) }/${ Math.round(this.vMax * 10) / 10 }`, this.mainShape.head)
    }
}
