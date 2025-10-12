import { track } from '../effect.js'
import { SignalEvent } from '../signal.js'
import { PropertyTracker, Tracker } from '../tracker.js'
import { detatch, proxy } from './index.js'

export class ArrayInstrumentation {
    constructor(signal, target) {
        this.signal = signal
        this.target = target
    }

    signal
    target;

    [Symbol.iterator] = () => this.iterator(this.target[Symbol.iterator]())
    values = () => this.iterator(this.target.values())
    entries = () => this.iterator(this.target.entries(), true)

    at = (i) => {
        track?.(new PropertyTracker(this.signal, i))
        return this.target.at(i)
    }

    forEach = (fn) => {
        track?.(new Tracker(this.signal))
        this.target.forEach((v, i, a) => fn(proxy(v, this.signal), i, a))
    }

    map = (fn) => {
        track?.(new Tracker(this.signal))
        return this.target.map((v, i, a) => fn(proxy(v, this.signal), i, a))
    }

    reduce = (fn, i) => {
        track?.(new Tracker(this.signal))
        return this.target.reduce((p, v, i, a) => fn(p, proxy(v, this.signal), i, a), i)
    }

    reduceRight = (fn, i) => {
        track?.(new Tracker(this.signal))
        return this.target.reduceRight((p, v, i, a) => fn(p, proxy(v, this.signal), i, a), i)
    }

    push = (...items) => {
        const result = this.target.push(...items)
        if (result > 0) {
            this.signal.dispatchEvent(new SignalEvent('push', { items }))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return result
    }

    pop = () => {
        const item = this.target.pop()
        if (item !== undefined) {
            detatch(item)

            this.signal.dispatchEvent(new SignalEvent('pop'))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return item
    }

    shift = () => {
        const item = this.target.shift()
        if (item !== undefined) {
            detatch(item)

            this.signal.dispatchEvent(new SignalEvent('shift'))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return item
    }

    unshift = (...items) => {
        const length = this.target.unshift(...items)
        if (items.length > 0) {
            this.signal.dispatchEvent(new SignalEvent('unshift', { items }))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return length
    }

    splice = (start, deleteCount, ...items) => {
        const deleted = this.target.splice(start, deleteCount, ...items)
        if (deleted.length > 0 || items?.length > 0) {
            deleted.forEach((i) => detatch(i))

            this.signal.dispatchEvent(new SignalEvent('splice', { start, deleteCount }))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return deleted
    }

    reverse = () => {
        const self = this.target.reverse()
        if (this.target.size > 1) {
            this.signal.dispatchEvent(new SignalEvent('reverse'))
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
        return self
    };

    *iterator(iter, isEntries = false) {
        track?.(new Tracker(this.signal))
        for (let item of iter) {
            if (isEntries) {
                item[1] = proxy(item[1], this.signal)
            } else {
                item = proxy(item, this.signal)
            }
            yield item
        }
    }
}
