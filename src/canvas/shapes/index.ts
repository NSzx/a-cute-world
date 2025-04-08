export interface WithCoordinates {
    x: number
    y: number
}

export abstract class WithIntersections {
    abstract intersect(other: WithIntersections): boolean

    abstract move(dx: number, dy: number): WithIntersections

    abstract moveTo(x: number, y: number): WithIntersections
}

export abstract class PointProperties extends WithIntersections implements WithCoordinates {
    abstract x: number
    abstract y: number
}

export abstract class CircleProperties extends WithIntersections implements WithCoordinates {
    abstract x: number
    abstract y: number
    abstract radius: number
    abstract theta: number
    abstract front: WithCoordinates
    abstract back: WithCoordinates
    abstract left: WithCoordinates
    abstract right: WithCoordinates

    abstract outerPoint(angle: number): WithCoordinates
}

export abstract class RectangleProperties extends WithIntersections implements WithCoordinates {
    abstract x: number
    abstract y: number
    abstract width: number
    abstract height: number
    abstract top: number
    abstract bottom: number
    abstract left: number
    abstract right: number
}

export abstract class ShapeProperties extends WithIntersections {
    abstract chain: CircleProperties[]
    abstract skinTension: number
    abstract skinResolution: number
}

export const distance = (a: WithCoordinates, b: WithCoordinates): number => {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}
