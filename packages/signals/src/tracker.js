let ASYNC = true
export function setAsync(async) {
    ASYNC = async
}

export class PropertyTracker {
    constructor(signal, property) {
        this.signal = signal
        this.property = property
        this.effect = null

        this.signal.addEventListener('set', this.callback)
        this.signal.addEventListener('delete', this.callback)
    }

    callback = (event) => {
        if (event.signal !== event.currentSignal) return
        if (event.property !== this.property) return
        ASYNC && this.effect.async ? this.effect.schedule() : this.effect.run()
    }

    dispose() {
        this.signal.removeEventListener('set', this.callback)
        this.signal.removeEventListener('delete', this.callback)
    }
}

export class AttributeTracker {
    constructor(signal, name) {
        this.signal = signal
        this.name = name
        this.effect = null

        this.signal.addEventListener('attributeChanged', this.callback)
    }

    callback = (event) => {
        if (event.signal !== event.currentSignal) return
        if (event.name !== this.name) return
        ASYNC && this.effect.async ? this.effect.schedule() : this.effect.run()
    }

    dispose() {
        this.signal.removeEventListener('attributeChanged', this.callback)
    }
}

export class Tracker {
    constructor(signal) {
        this.signal = signal
        this.effect = null

        this.signal.addEventListener('change', this.callback)
    }

    callback = (event) => {
        if (event.signal !== event.currentSignal) return
        ASYNC && this.effect.async ? this.effect.schedule() : this.effect.run()
    }

    dispose() {
        this.signal.removeEventListener('change', this.callback)
    }
}
