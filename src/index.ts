import {World} from "./world/World";

window.addEventListener("load", () => {
    const world = new World()
    document.getElementById("world-container")?.append(world.canvas)
})