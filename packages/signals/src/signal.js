import { track } from './effect.js'
import { proxy } from './proxy/index.js'
import { EventTracker, PropertyTracker } from './tracker.js'

export class Signal extends EventTarget {
    constructor(target) {
        super()
        this.#target = target

        instrument(this, this.constructor.observedProperties)
    }

    #target

    get target() {
        return this.#target
    }

    dispatchEvent(event) {
        event.signalTarget = this.#target ?? this
        return super.dispatchEvent(event)
    }

    trackEvent(eventName) {
        track(() => new EventTracker(this, eventName))
    }
}

export class SignalEvent extends Event {
    constructor(type, dict) {
        super(type)
        Object.assign(this, dict)
    }
}

export function signal(object) {
    return proxy(object)
}

function instrument(signal, properties = []) {
    for (const property of properties) {
        if (property in signal) {
            // do not override existing properties.
            // since instrument is clalled in super(), instance properties are not defined yet
            // and this will match getters and setters on the prototype chain.
            throw new Error(`Cannot observe property: ${property}`)
        }

        let value
        Object.defineProperty(signal, property, {
            get: () => {
                track(() => new PropertyTracker(signal, property))
                return value
            },
            set: (nextValue) => {
                if (nextValue !== value) {
                    value = nextValue
                    signal.dispatchEvent(new SignalEvent('propertyChanged', { property }))
                }
            }
        })
    }
}
