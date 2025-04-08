import { Vector } from "./Vector"
import {
    minmax,
    mod
} from "../utils"
import { TWOPI } from "../utils/constants"
import { Circle } from "../canvas/shapes/Circle"
import { ShapeArticulationLeeway } from "../canvas/shapes/Shape"

export const vSum = (...vectors: Vector[]): Vector => {
    let dx = 0, dy = 0
    for (let v of vectors) {
        dx += v.x
        dy += v.y
    }
    return Vector.cartesian(dx, dy)
}

/**
 * See ./restrictAngle.png
 * @param direction the angle to restrict
 * @param reference reference angle
 * @param minAngle (negative) clockwise limit
 * @param maxAngle (positive) anti-clockwise limit
 */
export const restrictAngle = (direction: number, reference: number, minAngle: number, maxAngle: number): number => {
    return minmax(minAngle + Math.PI, mod(direction - reference + Math.PI, TWOPI), maxAngle + Math.PI) + reference + Math.PI
}

export function forwardReachingKinematics(chain: Circle[],
                                          target: Circle,
                                          distances: number[],
                                          articulationsLeeway: ShapeArticulationLeeway[]): Circle[] {
    const newChain = [ target ]
    for (let i = 1; i < chain.length; i++) {
        const a1 = chain[i - 1]
        const a2 = newChain[i - 1]
        const b1 = chain[i]
        // Looking for b2
        const b1a1 = Vector.ab(b1, a1)
        const a1a2 = Vector.ab(a1, a2)
        const a2b1 = Vector.ab(a2, b1)
        const leeway = articulationsLeeway[i - 1]
        const a2b2Direction = restrictAngle(a2b1.d + Math.PI, a2.theta, leeway.minAngle, leeway.maxAngle) + Math.PI
        const a2b2 = Vector.polar(a2b2Direction, distances[i - 1])

        const b2 = b1.applyVector(vSum(b1a1, a1a2, a2b2))
        newChain.push(b2.rotateToMatch(Vector.ab(b2, a2)))
    }
    return newChain
}
