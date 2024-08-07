import {
    distance,
    ShapeProperties,
    WithIntersections
} from "./index"
import { Vector } from "../../physics/Vector"
import { Circle } from "./Circle"
import {
    preventBending,
    vSum
} from "../../physics"


export class Shape extends ShapeProperties {

    readonly head: Circle
    readonly distances: number[]
    constructor(public readonly chain: Circle[],
                public readonly minAngle: number,
                public readonly skinTension: number = 0.5,
                public readonly skinResolution: number = 10,
                distances?: number[]) {
        super()
        this.head = chain[0]
        this.distances = distances ?? chain.slice(1).map((c, i) => distance(c, chain[i]))
    }


    applyVector(vector: Vector): Shape {
        if (vector.m === 0) {
            return this
        }
        return this.moveHeadTo(this.chain[0].applyVector(vector))
    }

    moveHeadTo(head: Circle): Shape {
        let chain: Circle[] = [ head ]
        this.chain.slice(1).forEach((b1, previousIndex) => {
            const distance = this.distances[previousIndex]
            const a1 = this.chain[previousIndex]
            const a2 = chain[previousIndex]
            const b1a1 = Vector.ab(b1, a1)
            const a1a2 = Vector.ab(a1, a2)
            const a2b1 = Vector.ab(a2, b1)
            const a2b2Direction = preventBending(a2b1.d, a2.theta, this.minAngle)
            const a2b2 = Vector.polar(a2b2Direction, distance)
            const b2 = b1.applyVector(vSum(b1a1, a1a2, a2b2))
            chain.push(b2.rotateToMatch(Vector.ab(b2, a2)))
        })
        return new Shape(chain, this.minAngle, this.skinTension, this.skinResolution, this.distances)
    }

    move(dx: number, dy: number): WithIntersections {
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
}
