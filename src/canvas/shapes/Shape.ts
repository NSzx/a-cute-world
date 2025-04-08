import {
    distance,
    ShapeProperties,
    WithCoordinates,
    WithIntersections
} from "./index"
import { Vector } from "../../physics/Vector"
import { Circle } from "./Circle"
import { forwardReachingKinematics } from "../../physics"
import { last } from "../../utils"


export interface ShapeArticulationLeeway {
    minAngle: number
    maxAngle: number
}

export class Shape extends ShapeProperties {

    readonly head: Circle
    readonly tail: Circle
    readonly distances: number[]
    readonly articulationsLeeway: ShapeArticulationLeeway[]

    constructor(public readonly chain: Circle[],
                articulationsLeeway: number | ShapeArticulationLeeway | (ShapeArticulationLeeway | number)[],
                public readonly skinTension: number = 0.5,
                public readonly skinResolution: number = 10,
                distances?: number[]) {
        super()
        this.head = chain[0]
        this.tail = last(chain)
        this.distances = distances ?? chain.slice(1).map((c, i) => distance(c, chain[i]))
        this.articulationsLeeway = this.buildArticulationsLeeway(articulationsLeeway)
    }


    private buildArticulationsLeeway(input: number | ShapeArticulationLeeway | (ShapeArticulationLeeway | number)[]): ShapeArticulationLeeway[] {
        if (Array.isArray(input)) {
            return input.map(a => this.toArticulationsLeeway(a))
        }
        return new Array(this.chain.length - 1).fill(this.toArticulationsLeeway(input))
    }

    private toArticulationsLeeway(input: number | ShapeArticulationLeeway): ShapeArticulationLeeway {
        return typeof input === "number" ? { minAngle: -input, maxAngle: input } : input
    }

    applyVector(vector: Vector): Shape {
        if (vector.m === 0) {
            return this
        }
        return this.moveHeadTo(this.chain[0].applyVector(vector))
    }

    moveHeadTo(head: Circle): Shape {
        const newChain = forwardReachingKinematics(this.chain, head, this.distances, this.articulationsLeeway)
        return new Shape(newChain, this.articulationsLeeway, this.skinTension, this.skinResolution, this.distances)
    }

    translate(dx: number, dy: number): Shape {
        return new Shape(this.chain.map(c => c.translate(dx, dy)), this.articulationsLeeway, this.skinTension, this.skinResolution, this.distances)
    }

    move(dx: number, dy: number): Shape {
        return this.applyVector(Vector.cartesian(dx, dy))
    }

    moveTo(x: number, y: number): Shape {
        return this.moveHeadTo(this.chain[0].moveTo(x, y))
    }

    intersect(other: WithIntersections): boolean {
        if (other instanceof ShapeProperties) {
            return other.chain.some(point => this.intersect(point))
        }
        return this.chain.some(point => point.intersect(other))
    }

    /**
     * Simplified version of Forward And Backward Reaching Inverse Kinematics
     * @param anchor
     * @param target
     */
    fabrik(anchor: Circle, target: WithCoordinates): Shape {
        let newChain = forwardReachingKinematics(this.chain, anchor, this.distances, this.articulationsLeeway)
        let counter = 0
        let translationVector = Vector.ab(last(newChain), target)
        while (translationVector.m > 1 && counter < 7) {
            newChain = newChain.map(c => c.applyVector(translationVector, false))
            newChain = forwardReachingKinematics(newChain, anchor, this.distances, this.articulationsLeeway)
            translationVector = Vector.ab(last(newChain), target)
            counter++
        }
        return new Shape(newChain, this.articulationsLeeway, this.skinTension, this.skinResolution, this.distances)
    }
}
