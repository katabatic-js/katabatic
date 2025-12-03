export class Animate {
    constructor(fn, direction) {
        this.fn = fn
        this.direction = direction
    }

    #build(options) {
        if (!this.animation) {
            const animation = this.fn(options)

            animation.finished
                .catch(() => {})
                .finally(() => {
                    if (this.animation === animation) {
                        this.animation = undefined
                        this.reversed = undefined
                    }
                })

            this.animation = animation
            this.reversed = false
        }
    }

    #direction(direction) {
        if (this.animation) {
            if (direction === 'in' && this.reversed) {
                this.animation.reverse()
                this.reversed = false
            } else if (direction === 'out' && !this.reversed) {
                this.animation.reverse()
                this.reversed = true
            }
        }
    }

    #cancel() {
        if (this.animation) {
            this.animation.cancel()
            this.animation = undefined
            this.reversed = undefined
        }
    }

    run(direction) {
        if (this.direction === 'both') {
            this.#build({ direction: 'both' })
            this.#direction(direction)
        } else {
            if (direction !== this.direction) {
                this.#cancel()
            } else {
                this.#build({ direction })
            }
        }
        return this
    }

    dispose() {
        this.animation?.cancel()
        this.animation = undefined
        this.reversed = undefined
    }
}
