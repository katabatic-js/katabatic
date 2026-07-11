import { track } from '../effect.js'
import { SignalEvent } from '../signal.js'
import { PropertyTracker } from '../tracker.js'
import { proxy, unproxy } from './index.js'

export class ObjectHandler {
    signal
    proxy

    get(target, prop, receiver) {
        if (prop === 'addEventListener') return this.signal.addEventListener.bind(this.signal)
        if (prop === 'removeEventListener') return this.signal.removeEventListener.bind(this.signal)
        if (prop === 'snapshot') return () => structuredClone(target)
        if (prop === '$proxy') return this.proxy
        if (prop === '$target') return target

        track(() => new PropertyTracker(this.signal, prop))
        return proxy(Reflect.get(target, prop, receiver))
    }

    set(target, property, nextValue, receiver) {
        nextValue = unproxy(nextValue)
        const value = target[property]
        const result = Reflect.set(target, property, nextValue, receiver)

        if (result && value !== nextValue) {
            this.signal.dispatchEvent(new SignalEvent('propertyChanged', { property }))
        }
        return result
    }

    deleteProperty(target, property) {
        const hasValue = Object.hasOwn(target, property)
        const result = Reflect.deleteProperty(target, property)

        if (result && hasValue) {
            this.signal.dispatchEvent(new SignalEvent('propertyChanged', { property }))
        }
        return result
    }
}
