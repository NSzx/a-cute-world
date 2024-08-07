import { SQRT2Over2 } from "../utils/constants"
import { Vector } from "../physics/Vector"

export type Inputs = {
    direction: Vector
    keysDown: Set<string>
    keysPressed: Set<string>
    keysUp: Set<string>
}

export class InputsReader {

    private keysDown = new Set<string>()
    private keysPressed = new Set<string>()
    private keysUp = new Set<string>()

    constructor(private container: HTMLElement) {
        container.addEventListener("keydown", (e: KeyboardEvent) => {
            this.keysDown.add(e.key.toLowerCase())
            this.keysPressed.add(e.key.toLowerCase())
        })
        container.addEventListener("keyup", (e: KeyboardEvent) => {
            this.keysPressed.delete(e.key.toLowerCase())
            this.keysUp.add(e.key.toLowerCase())
        })
    }

    getCurrentInputs(): Inputs {
        let dx = 0, dy = 0
        if (this.keysPressed.has("z")) {
            dy -= (this.keysPressed.has("q") || this.keysPressed.has("d") ? SQRT2Over2 : 1)
        }
        if (this.keysPressed.has("s")) {
            dy += (this.keysPressed.has("q") || this.keysPressed.has("d") ? SQRT2Over2 : 1)
        }
        if (this.keysPressed.has("q")) {
            dx -= (this.keysPressed.has("z") || this.keysPressed.has("s") ? SQRT2Over2 : 1)
        }
        if (this.keysPressed.has("d")) {
            dx += (this.keysPressed.has("z") || this.keysPressed.has("s") ? SQRT2Over2 : 1)
        }
        let inputs: Inputs = {
            direction: Vector.cartesian(dx, dy),
            keysUp: new Set(this.keysUp),
            keysPressed: new Set(this.keysPressed),
            keysDown: new Set(this.keysDown),
        }
        this.keysDown.clear()
        this.keysUp.clear()
        return inputs
    }
}
