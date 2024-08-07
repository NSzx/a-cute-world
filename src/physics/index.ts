import { Vector } from "./Vector"
import {
    minmax,
    mod
} from "../utils"
import { TWOPI } from "../utils/constants"

export const vSum = (...vectors: Vector[]): Vector => {
    let dx = 0, dy = 0
    for (let v of vectors) {
        dx += v.x
        dy += v.y
    }
    return Vector.cartesian(dx, dy)
}

export const preventBending = (direction: number, reference: number, minAngle: number): number => {
    return minmax(minAngle, mod(direction - reference, TWOPI), mod(-minAngle, TWOPI)) + reference
}
export const restrictAngle = (direction: number, reference: number, maxAngle: number): number => {
    return minmax(-maxAngle + Math.PI, mod(direction - reference + Math.PI, TWOPI), maxAngle + Math.PI) + reference + Math.PI
}
