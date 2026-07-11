import { track } from '../effect.js'
import { SignalEvent } from '../signal.js'
import { EventTracker } from '../tracker.js'
import { proxy, unproxy } from './index.js'

export class ArrayHandler {
    signal
    proxy
    instrumentation

    get(target, prop, receiver) {
        if (prop === 'addEventListener') return this.signal.addEventListener.bind(this.signal)
        if (prop === 'removeEventListener') return this.signal.removeEventListener.bind(this.signal)
        if (prop === 'snapshot') return () => structuredClone(target)
        if (prop === '$proxy') return this.proxy
        if (prop === '$target') return target

        const instrument = instrumentation(prop)
        return instrument(Reflect.get(target, prop, receiver), target, this.signal)
    }
    set(target, property, nextValue, receiver) {
        nextValue = unproxy(nextValue)
        const value = target[property]
        const result = Reflect.set(target, property, nextValue, receiver)

        if (result && value !== nextValue) {
            this.signal.dispatchEvent(new SignalEvent('changed'))
        }
        return result
    }
    deleteProperty(target, property) {
        const hasPreviousValue = Object.hasOwn(target, property)
        const result = Reflect.deleteProperty(target, property)

        if (result && hasPreviousValue) {
            this.signal.dispatchEvent(new SignalEvent('changed'))
        }
        return result
    }
}

function instrumentation(method) {
    switch (method) {
        case [Symbol.iterator]:
        case 'values':
            return Instrumentation.callIteratorAccessor
        case 'entries':
            return Instrumentation.callEntryIteratorAccessor
        case 'sort':
            return Instrumentation.callABCallbackMutation
        case 'push':
        case 'pop':
        case 'shift':
        case 'unshift':
            return Instrumentation.callLengthMutation
        case 'copyWith':
        case 'fill':
        case 'reverse':
        case 'splice':
            return Instrumentation.callMutation
        case 'every':
        case 'forEach':
        case 'flatMap':
        case 'filter':
        case 'find':
        case 'findIndex':
        case 'findLast':
        case 'findLastIndex':
        case 'map':
        case 'some':
            return Instrumentation.callVIACallbackAccessor
        case 'reduce':
        case 'reduceRight':
            return Instrumentation.callPVIACallbackAccessor
        case 'toSorted':
            return Instrumentation.callABCallbackAccessor
        case 'at':
        case 'concat':
        case 'flat':
        case 'includes':
        case 'indexOf':
        case 'join':
        case 'keys':
        case 'lastIndexOf':
        case 'toLocaleString':
        case 'toLocaleString':
        case 'toReversed':
        case 'toSpliced':
        case 'toString':
        case 'with':
            return Instrumentation.callAccessor
    }

    //fallback to property access
    return (value, _, signal) => {
        track(() => new EventTracker(signal, 'changed'))
        return proxy(value)
    }
}

const Instrumentation = {
    callAccessor(value, target, signal) {
        return (...args) => {
            track(() => new EventTracker(signal, 'changed'))
            return value.apply(target, unproxy(args))
        }
    },

    callIteratorAccessor(value, target, signal) {
        return function* () {
            track(() => new EventTracker(signal, 'changed'))
            for (let item of value.apply(target)) {
                yield proxy(item, signal)
            }
        }
    },

    callEntryIteratorAccessor(value, target, signal) {
        return function* () {
            track(() => new EventTracker(signal, 'changed'))
            for (let entry of value.apply(target)) {
                yield [entry[0], proxy(entry[1], signal)]
            }
        }
    },

    callVIACallbackAccessor(value, target, signal) {
        return (fn, t) => {
            track(() => new EventTracker(signal, 'changed'))
            return value.call(target, (v, i, a) => fn(proxy(v), i, a), t)
        }
    },

    callPVIACallbackAccessor(value, target, signal) {
        return (fn, i) => {
            track(() => new EventTracker(signal, 'changed'))
            return value.call(target, (p, v, i, a) => fn(p, proxy(v), i, a), i)
        }
    },

    callABCallbackAccessor(value, target, signal) {
        return (fn) => {
            track(() => new EventTracker(signal, 'changed'))
            return value.call(target, (a, b) => fn(proxy(a), proxy(b)))
        }
    },

    callMutation(value, target, signal) {
        return (...args) => {
            const result = value.apply(target, unproxy(args))
            signal.dispatchEvent(new SignalEvent('changed'))
            return result
        }
    },

    callLengthMutation(value, target, signal) {
        return (...args) => {
            const previousLength = target.length
            const result = value.apply(target, unproxy(args))
            const length = target.length

            if (length !== previousLength) {
                signal.dispatchEvent(new SignalEvent('changed'))
            }
            return result
        }
    },

    callABCallbackMutation(value, target, signal) {
        return (fn) => {
            const result = value.call(target, (a, b) => fn(proxy(a), proxy(b)))
            signal.dispatchEvent(new SignalEvent('changed'))
            return result
        }
    }
}
