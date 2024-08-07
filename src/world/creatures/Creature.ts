import {CurrentInputs} from "../../controls/Inputs";
import {Item} from "../Item";
import {WeatherConditions} from "../Weather";


export abstract class Creature extends Item {


    constructor(x: number,
                y: number,
                public direction: number) {
        super(x, y);
    }

    abstract update(weather: WeatherConditions, inputs?: CurrentInputs)
}