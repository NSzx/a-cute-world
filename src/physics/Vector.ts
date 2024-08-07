import { WithCoordinates } from "../canvas/shapes"

export class Vector {

    static ab(a: WithCoordinates, b: WithCoordinates): Vector {
        return Vector.cartesian(b.x - a.x, b.y - a.y)
    }

    static cartesian(x: number, y: number) {
        return new Vector(
            Math.atan2(y, x),
            Math.sqrt(x * x + y * y),
            x,
            y
        )
    }

    static polar(d: number, m: number) {
        return new Vector(
            d,
            m,
            m * Math.cos(d),
            m * Math.sin(d),
        )
    }

    public readonly d: number
    public readonly m: number
    public readonly x: number
    public readonly y: number

    constructor(d: number, m: number, x: number, y: number) {
        if (m < 10e-4) {
            this.d = this.m = this.x = this.y = 0
        } else {
            this.d = d
            this.m = m
            this.x = x
            this.y = y
        }
    }

    multiply(r: number): Vector {
        return Vector.polar(r < 0 ? this.d + Math.PI : this.d, Math.abs(this.m * r))
    }

    cap(mMax: number): Vector {
        return Vector.polar(this.d, Math.min(this.m, mMax))
    }
}
