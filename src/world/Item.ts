import {CurrentInputs} from "../controls/Inputs";
import {WeatherConditions} from "./Weather";


export abstract class Item {

    constructor(public x: number,
                public y: number) {
    }

    abstract update(weather: WeatherConditions)

    abstract draw(ctx: CanvasRenderingContext2D)
}