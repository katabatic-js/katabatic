import { Signal } from '@katabatic/signals'

class Log extends Signal {
    static observedProperties = ['val']

    constructor() {
        super()
        setInterval(() => this.val++, 1000)
    }
}

export function log(element) {
    return new Log()
}
