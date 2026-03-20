import { track } from './effect.js'
import { proxy } from './proxy/index.js'
import { PropertyTracker } from './tracker.js'

export class Signal extends EventTarget {
    constructor(parent, target) {
        super()
        this.#parent = parent ?? null
        this.#target = target ?? this

        if (this.constructor.observedProperties) {
            let properties = this.constructor.observedProperties
            properties = Array.isArray(properties) ? properties : [properties]

            for (const property of properties) {
                instrument(this, property)
            }
        }
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

function instrument(object, property) {
    if (!Object.getOwnPropertyDescriptor(object, property)?.get) {
        let value = object[property]
        Object.defineProperty(object, property, {
            get: () => {
                track?.(new PropertyTracker(object, property))
                return value
            },
            set: (nextValue) => {
                const hasChange = value !== nextValue
                value = nextValue

                if (hasChange) {
                    object.dispatchEvent(new SignalEvent('set', { property }))
                }
            }
        })
    }
}
