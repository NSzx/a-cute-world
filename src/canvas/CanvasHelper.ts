import {
    CircleProperties,
    RectangleProperties,
    WithCoordinates,
    WithIntersections
} from "./shapes"
import {
    FontStyles,
    ShapeStyles
} from "./index"
import { Shape } from "./shapes/Shape"
import {
    PI2,
    PI6,
    TWOPI
} from "../utils/constants"
import { last } from "../utils"
import { Camera } from "./Camera"
import { curve } from "./libs/curve"
import { Item } from "../world/items/Item"
import { Vector } from "../physics/Vector"
import { Point } from "./shapes/Point"
import { vSum } from "../physics"
import { Circle } from "./shapes/Circle"


export class CanvasHelper {
    public renderedZone!: RectangleProperties

    constructor(public ctx: CanvasRenderingContext2D,
                private camera: Camera) {
        camera.addEventListener("updated", () => this.onCameraUpdate())
        this.onCameraUpdate()
    }


    private onCameraUpdate() {
        this.renderedZone = this.camera.asRectangle().scale(1.5)
        this.updateOrigin()
    }

    updateOrigin(): void {
        this.ctx.resetTransform()
        this.ctx.scale(1 / this.camera.renderScale, 1 / this.camera.renderScale)
        this.ctx.translate(-this.camera.left, -this.camera.top)
    }

    isVisible(item: Item) {
        return item.intersect(this.renderedZone)
    }

    setFont(fontsize: number, fontFamily: string = "arial", color: string = "black") {
        this.ctx.font = `${ fontsize }px ${ fontFamily }`
        this.ctx.fillStyle = color
    }

    setFontStyles(styles: FontStyles) {
        this.ctx.font = `${ styles.fontsize ?? 10 }px ${ styles.fontFamily ?? "arial" }`
        this.ctx.textBaseline = styles.baseline ?? "top"
        this.ctx.textAlign = styles.align ?? "left"
        this.ctx.fillStyle = styles.color ?? "black"
    }

    text(text: string, origin: WithCoordinates, styles?: FontStyles) {
        this.setFontStyles(styles ?? {})
        this.ctx.fillText(text, origin.x, origin.y)
    }

    draw(shape: WithIntersections, styles: ShapeStyles, debug = false) {
        if (shape instanceof CircleProperties) {
            this.circle(shape, styles, debug)
        }
        if (shape instanceof RectangleProperties) {
            this.rectangle(shape, styles, debug)
        }
        if (shape instanceof Shape) {
            this.shape(shape, styles, debug)
        }
    }

    private getSidePoint(c: Circle, ref: Circle | undefined, rotation: number): WithCoordinates {
        return ref ? c.applyVector(vSum(c.toVector(), ref.toVector()).withMagnitude(c.radius).rotate(rotation)) : c.outerPoint(rotation)
    }

    shape(s: Shape, styles: ShapeStyles, debug = false) {
        this.ctx.beginPath()
        const head = s.chain[0]
        let points = [
            head.front,
            head.outerPoint(-PI6),
            ...s.chain.map((c, i) => this.getSidePoint(c, s.chain[i + 1], -PI2)),
            last(s.chain).back,
            ...s.chain.slice().reverse().map((c, i, reversed) => this.getSidePoint(c, reversed[i - 1], PI2)),
            head.outerPoint(PI6),
        ]

        curve(this.ctx, points.flatMap(p => [ p.x, p.y ]), s.skinTension, s.skinResolution)
        this.applyStyles(styles)

        if (debug) {
            this.debugShape(s)
            this.debugCoordinates(points)
        }
    }

    rectangle(r: RectangleProperties, styles: ShapeStyles, debug = false) {
        this.ctx.beginPath()
        this.ctx.rect(r.left, r.top, r.width, r.height)
        this.applyStyles(styles)
        if (debug) {
            this.debugCoordinates([
                { x: r.left, y: r.top },
                { x: r.right, y: r.top },
                { x: r.right, y: r.bottom },
                { x: r.left, y: r.bottom },
            ])
        }
    }

    roundRectangle(r: RectangleProperties, radii: number[], styles: ShapeStyles) {
        this.ctx.beginPath()
        this.ctx.roundRect(r.left, r.top, r.width, r.height, radii)
        this.applyStyles(styles)
    }

    point(p: WithCoordinates, r: number, styles: ShapeStyles) {
        this.ctx.beginPath()
        this.ctx.arc(p.x, p.y, r, 0, 2 * Math.PI)
        this.applyStyles(styles)
    }

    circle(c: CircleProperties, styles: ShapeStyles, debug = false) {
        this.point(c, c.radius, styles)
        if (debug) {
            this.debugCoordinates([
                c,
                c.front
            ])
        }
    }

    line(a: WithCoordinates, b: WithCoordinates, styles: ShapeStyles) {
        this.ctx.beginPath()
        this.ctx.moveTo(a.x, a.y)
        this.ctx.lineTo(b.x, b.y)
        this.applyStyles(styles)
    }

    ellipse(center: WithCoordinates, rx: number, ry: number, rotation: number, styles: ShapeStyles,
            startAngle: number = 0, endAngle: number = TWOPI) {
        this.ctx.beginPath()
        this.ctx.ellipse(center.x, center.y, rx, ry, rotation, startAngle, endAngle)
        this.applyStyles(styles)
    }

    vector(origin: Point, vector: Vector, styles: ShapeStyles) {
        this.arrow(origin, origin.applyVector(vector), styles)
    }

    arrow(origin: WithCoordinates, head: WithCoordinates, styles: ShapeStyles) {
        this.line(origin, head, styles)
        this.point(head, (styles.lineWidth ?? 1) * 2, { fillStyle: styles.fillStyle ?? styles.strokeStyle })
    }

    private debugShape(shape: Shape, color: string = "white") {
        shape.chain.forEach((circle, index) => {
            this.draw(circle, { lineWidth: 2, strokeStyle: color })
            this.arrow(circle, circle.front, { lineWidth: 1, strokeStyle: color })
            this.line(circle, circle.outerPoint(shape.articulationsLeeway[index].minAngle), { lineWidth: 1, strokeStyle: color })
            this.line(circle, circle.outerPoint(shape.articulationsLeeway[index].maxAngle), { lineWidth: 1, strokeStyle: color })
        })
    }

    debugCoordinates(points: WithCoordinates[], color = "red") {
        points.forEach((p, i) => {
            this.point(p, 2, { fillStyle: color })
            this.setFont(10, "arial", color)
            this.ctx.fillText(`${ i } [${ Math.round(p.x) }, ${ Math.round(p.y) }]`, p.x + 3, p.y)
        })
    }

    pattern(shape: WithIntersections, img: HTMLImageElement) {
        let pattern = this.ctx.createPattern(img, "repeat")!
        this.draw(shape, { fillStyle: pattern })
    }

    applyStyles(styles: ShapeStyles) {
        if (styles.lineWidth != null && styles.strokeStyle != null) {
            this.ctx.lineCap = "round"
            this.ctx.lineJoin = "round"
            this.ctx.lineWidth = styles.lineWidth
            this.ctx.strokeStyle = styles.strokeStyle
            this.ctx.stroke()
        }
        if (styles.fillStyle != null) {
            this.ctx.fillStyle = styles.fillStyle
            this.ctx.fill()
        }
    }
}
