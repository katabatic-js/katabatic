import { Signal } from '../signal.js'
import { ObjectHandler } from './object.js'
import { ArrayHandler } from './array.js'

export function proxy(object) {
    if (typeof object !== 'object' || object === null) return object
    if (object.$proxy) return object.$proxy

    const handler = proxyHandler(object)
    if (handler) {
        const proxy = new Proxy(object, handler)
        handler.signal = new Signal(proxy)
        handler.proxy = proxy

        Object.defineProperty(object, '$proxy', {
            value: proxy,
            enumerable: false
        })

        return proxy
    }
    return object
}

export function unproxy(object) {
    if (Array.isArray(object)) {
        const result = []
        for (const obj of object) {
            if (typeof obj !== 'object' || obj === null) {
                result.push(obj)
            } else {
                result.push(obj.$target ?? obj)
            }
        }
        return result
    }

    if (typeof object !== 'object' || object === null) return object
    return object.$target ?? object
}

function proxyHandler(object) {
    if (object.constructor === Object) return new ObjectHandler(object)
    if (object.constructor === Array) return new ArrayHandler(object)
}



