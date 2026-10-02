import { Signal, SignalEvent, Boundary, track } from '@katabatic/signals'
import { AttributeTracker, PropertyTracker } from '@katabatic/signals/tracker'
import { Client } from './client.js'

export class RootClient extends Set {
    constructor(customElement) {
        super()
        this.customElement = customElement
        this.signal = new Signal(customElement)
        this.bindings = new WeakMap()
    }

    boundary(fn) {
        const boundary = new Boundary(fn, { orphaned: true }).init()
        this.add(boundary)
        return boundary
    }

    block(fn) {
        const block = new Client()
        fn(block)
        this.add(block)
        return block
    }

    lifecycle(event, fn) {
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
                            this.customElement.connectedMoveCallback?.()
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

    instrument(property) {
        if (!Object.getOwnPropertyDescriptor(this.customElement, property)?.get) {
            let value = this.customElement[property]

            Object.defineProperty(this.customElement, property, {
                get: () => {
                    track(() => new PropertyTracker(this.signal, property))
                    return value
                },
                set: (nextValue) => {
                    if (nextValue !== value) {
                        value = nextValue
                        this.signal.dispatchEvent(new SignalEvent('propertyChanged', { property }))
                    }
                }
            })
        }
    }

    trackAttribute(name) {
        track(() => new AttributeTracker(this.signal, name))
    }

    attributeChanged(name, value, nextValue) {
        if (value !== nextValue) {
            this.signal.dispatchEvent(new SignalEvent('attributeChanged', { name }))
        }
    }

    setBinding(element, binding) {
        this.bindings.set(element, binding)
    }

    getBinding = (element, create) => {
        let binding = this.bindings.get(element)
        if (!binding && create) {
            binding = {}
            this.bindings.set(element, binding)
        }
        return binding
    }

    dispose() {
        for (const entry of cleared(this)) {
            entry.dispose?.()
        }
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
