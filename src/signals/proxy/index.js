import { Signal, SignalEvent } from '../signal.js'
import { track } from '../effect.js'
import { Tracker, PropertyTracker } from '../tracker.js'
import { ArrayInstrumentation } from './array.js'

export function proxy(object, parent) {
    if (typeof object !== 'object' || object === null) return object

    const proxy = object.$proxy
    if (!proxy) {
        const handler = new (ProxyHandler(object))()
        const proxy = new Proxy(object, handler)
        handler.signal = new Signal(parent, proxy)
        handler.proxy = proxy

        Object.defineProperty(object, '$proxy', {
            value: proxy,
            enumerable: false
        })

        return proxy
    }

    proxy.attach(parent)
    return proxy
}

function unproxy(object) {
    if (typeof object !== 'object' || object === null) return object
    return object.$target ?? object
}

function attach(object, parent) {
    if (typeof object !== 'object' || object === null) return
    object.$proxy?.attach(parent)
}

export function detatch(object, parent) {
    if (typeof object !== 'object' || object === null) return
    object.$proxy?.detatch(parent)
}

function ProxyHandler(object) {
    if (object.constructor === Object) return ObjectHandler
    if (object.constructor === Array) return ArrayHandler
    throw new Error(`signal do not support instance of ${object.constructor}`)
}

class ObjectHandler {
    signal
    proxy

    get(target, prop, receiver) {
        if (prop === 'addEventListener') return this.signal.addEventListener.bind(this.signal)
        if (prop === 'removeEventListener') return this.signal.removeEventListener.bind(this.signal)
        if (prop === 'attach') return this.signal.attach.bind(this.signal)
        if (prop === 'detatch') return this.signal.detatch.bind(this.signal)
        if (prop === 'snapshot') return () => structuredClone(target)
        if (prop === '$proxy') return this.proxy
        if (prop === '$target') return target

        track?.(new PropertyTracker(this.signal, prop))
        return proxy(Reflect.get(target, prop, receiver), this.signal)
    }
    set(target, property, nextValue, receiver) {
        const value = target[property]
        const result = Reflect.set(target, property, nextValue, receiver)

        if (result && value !== nextValue) {
            detatch(value, this.signal)

            this.signal.dispatchEvent(new SignalEvent('set', { property }))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return result
    }
    deleteProperty(target, property) {
        const hasValue = Object.hasOwn(target, property)
        const value = hasValue ? target[property] : undefined
        const result = Reflect.deleteProperty(target, property)

        if (result && hasValue) {
            detatch(value)

            this.signal.dispatchEvent(new SignalEvent('delete', { property }))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return result
    }
}

class ArrayHandler {
    signal
    proxy
    instrumentation

    get(target, prop, receiver) {
        if (prop === 'addEventListener') return this.signal.addEventListener.bind(this.signal)
        if (prop === 'removeEventListener') return this.signal.removeEventListener.bind(this.signal)
        if (prop === 'attach') return this.signal.attach.bind(this.signal)
        if (prop === 'detatch') return this.signal.detatch.bind(this.signal)
        if (prop === 'snapshot') return () => structuredClone(target)
        if (prop === '$proxy') return this.proxy
        if (prop === '$target') return target

        this.instrumentation ??= new ArrayInstrumentation(this.signal, target)
        if (Object.hasOwn(this.instrumentation, prop)) return this.instrumentation[prop]

        if (prop === 'length') {
            track?.(new Tracker(this.signal))
            return Reflect.get(target, prop, receiver)
        }

        track?.(new PropertyTracker(this.signal, prop))
        return proxy(Reflect.get(target, prop, receiver), this.signal)
    }
    set(target, property, nextValue, receiver) {
        const value = target[property]
        const result = Reflect.set(target, property, nextValue, receiver)

        if (result && value !== nextValue) {
            detatch(value, this.signal)

            this.signal.dispatchEvent(new SignalEvent('set', { property }))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return result
    }
    deleteProperty(target, property) {
        const hasValue = Object.hasOwn(target, property)
        const value = hasValue ? target[property] : undefined
        const result = Reflect.deleteProperty(target, property)

        if (result && hasValue) {
            detatch(value)

            this.signal.dispatchEvent(new SignalEvent('delete', { property }))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return result
    }
}
