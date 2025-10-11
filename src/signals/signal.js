import { proxy } from './proxy/index.js'

export class Signal extends EventTarget {
    constructor(parent, target) {
        super()
        this.#parent = parent ?? null
        this.#target = target ?? this
    }

    #parent
    #target

    dispatchEvent(event) {
        event.signal ??= this.#target
        event.currentSignal = this.#target

        super.dispatchEvent(event)
        this.#parent?.dispatchEvent(event)
        return true
    }

    attach(parent) {
        if (this.#parent && this.#parent !== parent) {
            throw new Error('an object cannot be inserted multipletimes in the signal tree')
        }
        this.#parent = parent
    }

    detatch() {
        this.#parent = null
    }
}

export class SignalEvent extends Event {
    constructor(type, dict) {
        super(type)
        Object.assign(this, dict)
    }
}

export function signal(target) {
    return proxy(target)
}
