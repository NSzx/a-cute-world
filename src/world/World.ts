import { Creature } from "./items/moving/creatures/Creature"
import { Inputs } from "../controls/Inputs"
import { Item } from "./items/Item"
import { CanvasHelper } from "../canvas/CanvasHelper"
import { RectangleProperties } from "../canvas/shapes"
import { Rectangle } from "../canvas/shapes/Rectangle"
import { Fly } from "./items/moving/creatures/airborne/Fly"
import { WeatherConditions } from "./Weather"
import { Snake } from "./items/moving/creatures/walking/Snake"
import {
    rand,
    repeat
} from "../utils"
import {
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "../utils/constants"
import { Lezard } from "./items/moving/creatures/walking/Lezard"

export class World {

    drowned: Item[] = []
    swimming: Creature[] = []
    floating: Item[] = []
    grounded: Item[] = []
    walking: Creature[] = []
    airborne: Item[] = []
    flying: Creature[] = []

    get allItems(): Item[] {
        return [
            ...this.drowned,
            ...this.swimming,
            ...this.floating,
            ...this.grounded,
            ...this.walking,
            ...this.airborne,
            ...this.flying,
        ]
    }

    get creatures(): Creature[] {
        return [
            ...this.swimming,
            ...this.walking,
            ...this.flying,
        ]
    }

    inbound: RectangleProperties
    outOfBounds: RectangleProperties

    grass?: HTMLImageElement

    constructor(public readonly width: number,
                public readonly height: number) {
        this.inbound = Rectangle.fromBorders(0, 0, width, height)
        this.outOfBounds = Rectangle.fromBorders(-width, -width, width * 3, height * 3)
        repeat(60, () => this.flying.push(Fly.random()))
        repeat(30, () => this.walking.push(Snake.random()))
        repeat(30, () => this.walking.push(Lezard.random()))
        this.walking.push(new Lezard(
            WORLD_WIDTH/2,
            WORLD_HEIGHT/2,
            20,
            0,
            Math.round(rand(0, 360))
        ))
        this.loadResources()
    }

    currentWeather: WeatherConditions = {}

    update(inputs: Inputs, controlledItem?: Item) {
        this.allItems.forEach(i => i.update(this.currentWeather, i === controlledItem ? inputs : undefined))
    }

    draw(helper: CanvasHelper) {
        helper.rectangle(this.outOfBounds, { fillStyle: "#395732" })

        if (this.grass) {
            helper.pattern(this.inbound, this.grass)
        } else {
            helper.rectangle(this.inbound, { fillStyle: "#73c98e" })
        }

        this.allItems.filter(i => helper.isVisible(i)).forEach(i => i.draw(helper))
    }

    private loadResources(): void {
        const grass = new Image()
        grass.src = "/resources/grass.jpg"
        grass.onload = () => {
            this.grass = grass
        }
    }
}
