class Increment extends EventTarget {
    value = 0

    constructor(element, opts) {
        super()
        
        setInterval(() => {
            this.value++
            this.dispatchEvent(new Event('increment'))
        }, 1000)
    }
}

export function increment(element, opts) {
    return new Increment(element, opts)
}
