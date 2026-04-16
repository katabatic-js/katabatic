import { Effect } from '@katabatic/signals'
import { Animate } from './animate.js'

export class Client extends Set {
    effect(fn) {
        const effect = new Effect(fn, { orphaned: true, async: true }).run()
        this.add(effect)
        return effect
    }

    in() {}

    out(callback) {
        callback()
    }

    run() {
        for (const entry of this) {
            entry.run?.()
        }
    }

    pause() {
        for (const entry of this) {
            entry.pause?.()
        }
    }

    dispose() {
        for (const entry of cleared(this)) {
            entry.dispose?.()
        }
    }
}

export class AnimatedClient extends Client {
    animate(direction, fn) {
        const animate = new Animate(fn, direction)
        this.add(animate)
        return animate
    }

    in() {
        if (!this.playingIn) {
            const playingIn = this.#playAnimates('in')?.then(() => {
                if (this.playingIn === playingIn) {
                    this.playingIn = undefined
                }
            })

            if (this.playingOut) {
                this.run()
            }

            this.playingIn = playingIn
            this.playingOut = undefined
        }
    }

    out(callback) {
        if (!this.playingOut) {
            const playingOut = this.#playAnimates('out')?.then((completed) => {
                if (this.playingOut === playingOut) {
                    if (completed) {
                        callback()
                    }
                    this.playingOut = undefined
                }
            })

            if (playingOut) {
                this.pause()
            } else {
                callback()
            }

            this.playingOut = playingOut
            this.playingIn = undefined
        }
    }

    #playAnimates(direction) {
        const playingPromises = []
        for (const entry of this) {
            const animation = entry.play?.(direction)
            if (animation) {
                playingPromises.push(animation.finished)
            }
        }

        if (playingPromises.length > 0) {
            return Promise.all(playingPromises)
                .then(() => true)
                .catch(() => false)
        }
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
