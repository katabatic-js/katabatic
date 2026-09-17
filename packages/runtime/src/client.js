import { Effect } from '@katabatic/signals'

export class Client extends Set {
    effect(fn) {
        const effect = new Effect(fn, { orphaned: true }).run()
        this.add(effect)
        return effect
    }

    bind(element, fn, options, registry) {
        const binding = fn(element, options)
        if (binding) {
            binding.getBinding = registry.getBinding
            this.add(binding)
            registry.setBinding(element, binding)
        }
        return binding
    }

    dispose() {
        for (const entry of cleared(this)) {
            entry.dispose?.()
        }
    }
}

export class AnimatedClient extends Client {
    #animations = []
    #in
    #out
    #callback

    animate(element, fn, options, direction) {
        const animate = new Animate(fn, element, options, direction)
        this.add(animate)
        return animate
    }

    in() {
        if (!this.#in) {
            for (const entry of this) {
                const animation = entry.play?.('in')
                if (animation) this.#animations.push(animation)
            }

            if (this.#animations.length > 0) {
                this.#in = Promise.all(this.#animations.map((a) => a.finished))
                    .finally(() => {
                        this.#in = undefined
                        this.#animations = []
                    })
                    .catch(() => {})
            }
        }
    }

    out(callback) {
        if (!this.#out) {
            // pause in animations
            for (const animation of this.#clearedAnimations()) {
                animation.pause()
                animation.commitStyles()
                animation.cancel()
            }

            // play out animations and dispose everything else
            for (const entry of [...this]) {
                const animation = entry.play?.('out')
                if (animation) {
                    this.#animations.push(animation)
                } else {
                    entry.dispose?.()
                    this.delete(entry)
                }
            }

            if (this.#animations.length > 0) {
                this.#callback = callback
                this.#out = Promise.all(this.#animations.map((a) => a.finished))
                    .finally(() => {
                        this.#callback?.()
                        this.#callback = undefined
                        this.#out = undefined
                        this.#animations = []
                    })
                    .catch(() => {})
                return
            }
            callback?.()
        }
    }

    finish() {
        if (this.#out) {
            this.#callback?.()
            this.#callback = undefined

            for (const animation of this.#clearedAnimations()) {
                animation.finish()
            }
            return true
        }
        return false
    }

    #clearedAnimations() {
        const entries = this.#animations
        this.#animations = []
        return entries
    }
}

class Animate {
    constructor(fn, element, options, direction) {
        this.fn = fn
        this.element = element
        this.options = options
        this.direction = direction
    }

    play(direction) {
        if (this.fn && this.direction.includes(direction)) {
            this.animation = this.fn(this.element, { ...this.options, direction })
            this.animation.finished.finally(() => (this.animation = undefined)).catch(() => {})
            return this.animation
        }
    }

    dispose() {
        this.fn = undefined
        this.element = undefined
        this.options = undefined
        this.direction = undefined

        this.animation?.finish()
        this.animation = undefined
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
