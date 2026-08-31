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
    const signal = new Signal(customElement)
    const bindings = new WeakMap()

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
        if (!Object.getOwnPropertyDescriptor(customElement, property)?.get) {
            let value = customElement[property]

            Object.defineProperty(customElement, property, {
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

    client.trackAttribute = function (name) {
        track(() => new AttributeTracker(signal, name))
    }

    client.attributeChanged = function (name, value, nextValue) {
        if (value !== nextValue) {
            signal.dispatchEvent(new SignalEvent('attributeChanged', { name }))
        }
    }

    client.bind = function(element, fn, _client) {
        function opts(value) {
            return {...value, getBinding: client.getBinding}
        }

        const binding = fn(opts)
        bindings.set(element, binding)
        _client.add(binding)
        return binding
    }

    client.getBinding = function (element) {
        let binding = bindings.get(element)
        if (!binding) {
            binding = {}
            bindings.set(element, binding)
        }
        return binding
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
