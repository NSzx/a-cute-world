import { Circle } from "../canvas/shapes/Circle"
import { Inputs } from "../controls/Inputs"
import { CanvasHelper } from "../canvas/CanvasHelper"
import { Item } from "../world/items/Item"
import { Camera } from "../canvas/Camera"


export class HUD {

    pauseScreen: HTMLElement
    controls: HTMLElement
    private paused: boolean = false

    constructor() {
        this.pauseScreen = document.getElementById("pause-screen")!
        this.controls = document.getElementById("controls")!
        this.setPaused(true)
        this.updateControls()
    }

    draw(helper: CanvasHelper, camera: Camera, inputs: Inputs) {
        // helper.roundRectangle(helper.renderedZone, [ 20 ], { lineWidth: 4, strokeStyle: "red" })
        // helper.roundRectangle(camera.asRectangle(), [ 20 ], { lineWidth: 4, strokeStyle: "blue" })
        if (!this.paused) {
            let inputsOffset = 60 * camera.renderScale
            let inputsRadius: number = 40 * camera.renderScale
            let inputsCircle = new Circle(camera.right - inputsOffset, camera.bottom - inputsOffset, inputsRadius, 0)
            helper.circle(inputsCircle.scale(1.2), { fillStyle: "rgba(10,10,10,0.4)" })
            helper.circle(inputsCircle, { lineWidth: 2 * camera.renderScale, strokeStyle: "lightgrey" })
            helper.vector(inputsCircle, inputs.direction.multiply(inputsRadius), { lineWidth: 3 * camera.renderScale, strokeStyle: "white" })
        }
    }

    setPaused(paused: boolean): void {
        this.paused = paused
        if (paused) {
            this.pauseScreen.classList.remove("hidden")
        } else {
            this.pauseScreen.classList.add("hidden")
        }
    }

    updateControls(controlledItem?: Item, trackedItem?: Item): void {
        this.controls.innerHTML = ""
        this.addControl("[ Esc ] Resume")
        this.addControl("[ Z | Q | S | D ] Move")
        this.addControl("[ ↑ | ↓ ] Zoom")
        this.addControl(controlledItem ? "[ C ] Release the creature" : "[ C ] Control the closest creature")
        this.addControl(trackedItem ? "[ T ] Stop tracking" : "[ T ] Track the closest creature")
    }

    private addControl(text: string) {
        let p2 = document.createElement("span")
        p2.innerText = text
        this.controls.append(p2)
    }
}
