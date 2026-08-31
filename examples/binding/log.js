class Log extends EventTarget {
    val = 0

    constructor(element, opts) {
        super()
        setInterval(() => {
            console.log(opts.getBinding(element))
            this.val++
            this.dispatchEvent(new CustomEvent('val'))
        }, 1000)
    }
}

export function log(element, opts) {
    return new Log(element, opts)
}
