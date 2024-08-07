import { WithCoordinates } from "../canvas/shapes"

export const last = <T>(arr: T[]): T => arr[arr.length - 1]

export const minmax = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max))


export const middle = (a: WithCoordinates, b: WithCoordinates): WithCoordinates => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

export const mod = (n: number, m: number): number => ((n % m) + m) % m

export const rand = (min: number, max: number): number => Math.random() * (max - min) + min

export const repeat = (n: number, callback: Function) => {
    for (let i = 0; i < n; i++) {
        callback()
    }
}

export type Constructor = new (...args: any[]) => {};

export interface EventRegistration {
    remove(): void
}

export function withEvents<T extends Constructor>(Base: T) {
    return class extends Base implements EventTarget {

        readonly eventBus: EventTarget = document.createElement("span")

        addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): EventRegistration {
            this.eventBus.addEventListener(type, callback, options)
            return { remove: () => this.removeEventListener(type, callback, options) }
        }

        dispatchEvent(event: Event): boolean {
            return this.eventBus.dispatchEvent(event)
        }

        removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
            this.eventBus.removeEventListener(type, callback, options)
        }
    }
}
