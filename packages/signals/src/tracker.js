let ASYNC = true
export function setAsync(async) {
    ASYNC = async
}

/**
 * @typedef Tracker
 * @property {() => {}} dispose - Disposes the tracker and removes any event listeners from the signal.
 */

/**
 * A tracker that listens for a specific event on a signal and runs an effect when the event is dispatched.
 * @extends Tracker
 */
export class EventTracker {
    /**
     * Creates an instance of EventTracker.
     * @param {import('./signal.js').Signal} signal - The signal to listen for events on.
     * @param {string} eventName - The name of the event to listen for.
     */
    constructor(signal, eventName) {
        this.signal = signal
        this.eventName = eventName
        this.effect = null

        this.signal.addEventListener(eventName, this.callback)
    }

    callback = () => {
        ASYNC && this.effect.async ? this.effect.schedule() : this.effect.run()
    }

    dispose() {
        this.signal.removeEventListener(this.eventName, this.callback)
    }
}

/**
 * A tracker that listens for changes to a specific property on a signal and runs an effect when the property changes.
 */
export class PropertyTracker {
    /**
     * Creates an instance of PropertyTracker.
     * @param {import('./signal.js').Signal} signal - The signal to listen for events on.
     * @param {string} property - The name of the property to track.
     */
    constructor(signal, property) {
        this.signal = signal
        this.property = property
        this.effect = null

        this.signal.addEventListener('propertyChanged', this.callback)
    }

    callback = (event) => {
        if (event.property !== this.property) return
        ASYNC && this.effect.async ? this.effect.schedule() : this.effect.run()
    }

    dispose() {
        this.signal.removeEventListener('propertyChanged', this.callback)
    }
}

/**
 * A tracker that listens for changes to a specific attribute on a signal and runs an effect when the attribute changes.
 */
export class AttributeTracker {
    /**
     * Creates an instance of AttributeTracker.
     * @param {import('./signal.js').Signal} signal - The signal to listen for events on.
     * @param {string} name - The name of the attribute to track.
     */
    constructor(signal, name) {
        this.signal = signal
        this.name = name
        this.effect = null

        this.signal.addEventListener('attributeChanged', this.callback)
    }

    callback = (event) => {
        if (event.name !== this.name) return
        ASYNC && this.effect.async ? this.effect.schedule() : this.effect.run()
    }

    dispose() {
        this.signal.removeEventListener('attributeChanged', this.callback)
    }
}
