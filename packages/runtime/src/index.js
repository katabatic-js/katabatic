import { Signal, SignalEvent, Boundary, track } from '@katabatic/signals'
import { AttributeTracker, PropertyTracker } from '@katabatic/signals/tracker'
import { Client } from './client.js'
import { EachBlock } from './eachBlock.js'
import { IfBlock } from './ifBlock.js'

export { EachBlock, IfBlock }

export function $$(customElement) {
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

    client.boundary = function (fn) {
        const boundary = new Boundary(fn, { orphaned: true }).init()
        this.add(boundary)
        return boundary
    }

    client.block = function (fn) {
        const block = new Client()
        fn(block)
        this.add(block)
        return block
    }

    client.lifecycle = function (event, fn) {
        this.state ??= 'idle'

        switch (this.state) {
            case 'connected':
                if (event === 'disconnected') {
                    this.state = 'disconnecting'
                    queueMicrotask(() => {
                        if (this.state === 'disconnecting') {
                            this.state = 'disconnected'
                            fn()
                        } else {
                            this.state = 'connected'
                            customElement.connectedMoveCallback?.()
                        }
                    })
                }
                break
            case 'disconnecting':
                if (event === 'connected') {
                    this.state = 'connected'
                }
                break
            case 'disconnected':
            case 'idle':
                if (event === 'connected') {
                    this.state = 'connected'
                    fn()
                }
                break
        }
    }

    client.instrument = function (property) {
        this.signal ??= new Signal(undefined, customElement)

        if (!Object.getOwnPropertyDescriptor(customElement, property)?.get) {
            let value = customElement[property]
            Object.defineProperty(customElement, property, {
                get: () => {
                    track?.(new PropertyTracker(this.signal, property))
                    return value
                },
                set: (nextValue) => {
                    const hasChange = value !== nextValue
                    value = nextValue

                    if (hasChange) {
                        this.signal.dispatchEvent(new SignalEvent('set', { property }))
                        this.signal.dispatchEvent(new SignalEvent('change'))
                    }
                }
            })
        }
    }

    client.trackAttribute = function (name) {
        this.signal ??= new Signal(undefined, customElement)
        track?.(new AttributeTracker(this.signal, name))
    }

    client.attributeChanged = function (name, value, nextValue) {
        if (value !== nextValue) {
            this.signal ??= new Signal(undefined, customElement)
            this.signal.dispatchEvent(new SignalEvent('attributeChanged', { name }))
        }
    }

    client.getBindingProp = function (object, property, fn) {
        if (
            !!Object.getOwnPropertyDescriptor(object, property)?.get ||
            !!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object), property)?.get
        ) {
            this.locked = true
            fn(object[property])
            this.locked = false
            return true
        }
        return false
    }

    client.setBindingProp = function (object, property, value) {
        if (
            !!Object.getOwnPropertyDescriptor(object, property)?.set ||
            !!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object), property)?.set
        ) {
            if (!this.locked) object[property] = value
            return true
        }
        return false
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
