import {Creature} from "./creatures/Creature";
import {CurrentInputs} from "../controls/Inputs";
import {Item} from "./Item";

export class World {

    drowned: Item[]
    swimming: Creature[]
    floating: Item[]
    grounded: Item[]
    walking: Creature[]
    airborne: Item[]
    flying: Creature[]
    constructor(public readonly width = 16_000,
                public readonly height = 9_000) {
    }


    update(inputs: CurrentInputs) {

    }
    draw(ctx: CanvasRenderingContext2D) {

    }
}
