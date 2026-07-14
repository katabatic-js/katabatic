import { track } from './effect.js'
import { proxy } from './proxy/index.js'
import { EventTracker, PropertyTracker } from './tracker.js'

/**
 * A Signal is an object that can dispatch events and track changes.
 * It extends the EventTarget class, allowing it to dispatch events.
 */
export class Signal extends EventTarget {
    /**
     * Creates a new Signal instance.
     * @param {*} target - The target object to associate with the signal.
     */
    constructor(target) {
        super()
        this.#target = target

        instrument(this, this.constructor.observedProperties)
    }

    #target

    /**
     * The target object that the signal is associated with.
     * If no target is provided, the signal itself will be used as the event's signalTarget property.
     */
    get target() {
        return this.#target
    }

    dispatchEvent(event) {
        event.signalTarget = this.#target ?? this
        return super.dispatchEvent(event)
    }

    /**
     * Register a tracker if an effect is present in the execution context.
     * If a string is passed, a new EventTracker will be created with the string as the event type.
     * @param {(string | () => import('./tracker.js').Tracker)} fn - The event type or a function that returns a Tracker instance.
     */
    trackEvent(fn) {
        if (typeof fn == 'string') {
            fn = () => new EventTracker(this, fn)
        }
        track(fn)
    }
}

/**
 * An event that is dispatched by a Signal.
 */
export class SignalEvent extends Event {
    constructor(type, dict) {
        super(type)
        Object.assign(this, dict)
    }
}

/**
 * Creates a signal from an object.
 * Objects and Arrays are wrapped in a proxy that intercepts property access, allowing for tracking and dispatching events when properties change.
 * Any other type of object is returned as-is.
 * @param {*} object - The object to create a signal for.
 * @returns {Proxy} - A proxy that wraps the object and intercepts property access.
 */
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
