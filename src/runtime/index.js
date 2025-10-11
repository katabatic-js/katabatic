import { Boundary, Effect, track } from '../signals/effect.js'
import { Signal, SignalEvent } from '../signals/signal.js'
import { AttributeTracker, PropertyTracker } from '../signals/tracker.js'
import { Client } from './client.js'
import { EachBlock } from './eachBlock.js'
import { IfBlock } from './ifBlock.js'

export { EachBlock, IfBlock }

export function $$(customElement) {
    Client.prototype.effect ??= function (fn) {
        const effect = new Effect(fn, true).run()
        this.add(effect)
        return effect
    }

    Client.prototype.ifBlock ??= function (anchor, getCondition, concequent, alternate) {
        const block = new IfBlock(anchor, getCondition, concequent, alternate).init()
        this.add(block)
        return block
    }

    Client.prototype.eachBlock ??= function (anchor, getIterable, getKey, body) {
        const block = new EachBlock(anchor, getIterable, getKey, body).init()
        this.add(block)
        return block
    }

    const client = new Client()
    let signal

    client.boundary = function (fn) {
        const boundary = new Boundary(fn, true).init()
        this.add(boundary)
        return boundary
    }

    client.block = function (fn) {
        const block = new Client()
        fn(block)
        this.add(block)
        return block
    }

    client.lifecycle = function (event) {
        const set = (state, result) => {
            this.state = state
            return result
        }

        switch (this.state) {
            case 'connected':
                if (event === 'disconnected') return set('disconnected', false)
                if (event === 'microtask') return set('connected', false)
                break
            case 'disconnected':
                if (event === 'connected') return set('connected', false)
                if (event === 'microtask') return set('disconnected', true)
                break
            default:
                if (event === 'connected') return set('connected', true)
                break
        }
    }

    client.instrument = function (property) {
        signal ??= new Signal(undefined, customElement)

        let value = customElement[property]
        Object.defineProperty(customElement, property, {
            get: () => {
                track?.(new PropertyTracker(signal, property))
                return value
            },
            set: (nextValue) => {
                const hasChange = value !== nextValue
                value = nextValue

                if (hasChange) {
                    signal.dispatchEvent(new SignalEvent('set', { property }))
                    signal.dispatchEvent(new SignalEvent('change'))
                }
            }
        })
    }

    client.trackAttribute = function (name) {
        signal ??= new Signal(undefined, customElement)
        track?.(new AttributeTracker(signal, name))
    }

    client.attributeChanged = function (name, value, nextValue) {
        if (value !== nextValue) {
            signal ??= new Signal(undefined, customElement)
            signal.dispatchEvent(new SignalEvent('attributeChanged', { name }))
        }
    }

    return client
}

$$.init = function (object, property, value) {
    const isSetter = arguments.length === 2

    if (object.hasOwnProperty(property)) {
        value = object[property]
        delete object[property]

        if (isSetter) {
            object[property] = value
        }
    }
    return value
}
