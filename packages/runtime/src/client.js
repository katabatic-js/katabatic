import { Effect } from '@katabatic/signals'
import { Animate } from './animate.js'

export class Client extends Set {
    effect(fn) {
        const effect = new Effect(fn, { orphaned: true, async: false }).run()
        this.add(effect)
        return effect
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

    runAnimate(direction, callback) {
        const promises = []
        for (const entry of this) {
            if (entry instanceof Animate) {
                promises.push(entry.run(direction).animation?.finished)
            }
        }

        const finished = Promise.all(promises)
            .catch(() => {})
            .finally(() => {
                if (this.finished === finished) {
                    callback?.()
                }
            })
        this.finished = finished
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
