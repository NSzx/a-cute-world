import { Creature } from "./items/moving/creatures/Creature"
import { Inputs } from "../controls/Inputs"
import { Item } from "./items/Item"
import { CanvasHelper } from "../canvas/CanvasHelper"
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


    grass?: HTMLImageElement
    readonly halfWidth: number
    readonly halfHeight: number

    constructor(public readonly width: number,
                public readonly height: number) {
        this.halfWidth = Math.floor(this.width / 2)
        this.halfHeight = Math.floor(this.height / 2)
        repeat(60, () => this.flying.push(Fly.random()))
        repeat(30, () => this.walking.push(Snake.random()))
        repeat(30, () => this.walking.push(Lezard.random()))
        this.walking.push(new Lezard(
            WORLD_WIDTH / 2,
            WORLD_HEIGHT / 2,
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

    wrapItems(camera: Rectangle): void {
        this.allItems.forEach(i => {
            const distanceX: number = i.mainShape.head.x - camera.x
            if (distanceX > this.halfWidth) {
                i.translate(-this.width, 0)
            }
            if (distanceX < -this.halfWidth) {
                i.translate(this.width, 0)
            }
            const distanceY: number = i.mainShape.head.y - camera.y
            if (distanceY > this.halfHeight) {
                i.translate(0, -this.height)
            }
            if (distanceY < -this.halfHeight) {
                i.translate(0, this.height)
            }
        })
    }

    private getFloor(nx: number, ny: number): Rectangle {
        return Rectangle.fromBorders(nx * this.width, ny * this.height, (nx + 1) * this.width, (ny + 1) * this.height)
    }

    draw(helper: CanvasHelper, camera: Rectangle) {
        const nx = Math.floor(camera.x / this.width)
        const ny = Math.floor(camera.y / this.height)

        this.drawFloor(helper, this.getFloor(nx, ny))
        const neighbourFloors = [
            this.getFloor(nx - 1, ny - 1),
            this.getFloor(nx, ny - 1),
            this.getFloor(nx + 1, ny - 1),
            this.getFloor(nx - 1, ny),
            //this.getFloor(nx, ny), // always drawn
            this.getFloor(nx + 1, ny),
            this.getFloor(nx - 1, ny + 1),
            this.getFloor(nx, ny + 1),
            this.getFloor(nx + 1, ny + 1),
        ]
        neighbourFloors.filter(f => camera.intersect(f))
                       .forEach(f => this.drawFloor(helper, f))

        this.allItems.filter(i => helper.isVisible(i)).forEach(i => i.draw(helper))
    }

    private drawFloor(helper: CanvasHelper, floor: Rectangle) {
        if (this.grass) {
            helper.pattern(floor, this.grass)
        } else {
            helper.rectangle(floor, { fillStyle: "#73c98e" })
        }
    }

    private loadResources(): void {
        const grass = new Image()
        grass.src = "/resources/grass.jpg"
        grass.onload = () => {
            this.grass = grass
        }
    }
}
