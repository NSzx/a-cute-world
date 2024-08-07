import { Game } from "./Game"

window.addEventListener("load", () => {
    const game = new Game(document.getElementById("world-container")!)
    game.start()
})
