export type Viewport = {
    x: number
    y: number
    left: number
    right: number
    top: number
    bottom: number
}

export type ShapeStyles = {
    lineWidth?: number
    strokeStyle?: string | CanvasGradient | CanvasPattern
    fillStyle?: string | CanvasGradient | CanvasPattern
}
