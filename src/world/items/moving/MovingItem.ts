import {
    restrictAngle,
    vSum
} from "../../../physics"
import { Item } from "../Item"
import { Vector } from "../../../physics/Vector"
import { WeatherConditions } from "../../Weather"


export abstract class MovingItem extends Item {
    abstract v: Vector
    abstract readonly vMax: number
    abstract readonly maxDirectionAngle: number
    abstract readonly friction: number
    abstract readonly acceleration: number
    abstract readonly windResistance: number
    private _uncappedVMax?: number
    get uncappedVMax(): number {
        // uncappedVMax est tel que (uncappedVMax+20) * 0.7 = uncappedVMax
        // acc * friction = (1 - friction) * uncappedVMax
        // uncappedVMax = acc * friction / (1-friction)
        return this._uncappedVMax ?? (this._uncappedVMax = this.acceleration * this.friction / (1 - this.friction))
    }

    get realVMax(): number {
        return Math.min(this.vMax, this.uncappedVMax)
    }

    get relativeVelocity(): number {
        return this.v.m / this.realVMax
    }

    handlePhysics(weather: WeatherConditions, direction: Vector) {
        let correctedDirection = Vector.polar(restrictAngle(direction.d, this.v.d, -this.maxDirectionAngle, this.maxDirectionAngle), direction.m)
        this.v = vSum(this.v, correctedDirection.multiply(this.acceleration)).multiply(this.friction).cap(this.vMax)
    }
}
