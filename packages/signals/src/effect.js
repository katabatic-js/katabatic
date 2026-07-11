let context

export function track(fn) {
    context?.track?.(fn())
}

export class Effect extends Set {
    constructor(fn, { orphaned = false, async = true } = {}) {
        super()
        this.fn = fn
        this.async = async
        this.microtask = false

        if (!orphaned) {
            context?.add(this)
        }
    }

    run() {
        if (context === this) {
            // prevent infinite loop
            return this
        }

        if (this.fn) {
            // dispose both trackers and nested effects / boundaries
            for (const entry of cleared(this)) {
                entry.dispose()
            }

            const outerContext = context
            try {
                context = null
                this.teardown?.()
                this.teardown = null

                context = this
                this.teardown = this.fn()
                this.teardown = typeof this.teardown === 'function' ? this.teardown : null
            } finally {
                context = outerContext
            }
        }

        return this
    }

    schedule() {
        if (context === this) {
            // prevent infinite loop
            return
        }

        if (!this.microtask) {
            this.microtask = true
            queueMicrotask(() => {
                if (this.microtask) {
                    this.microtask = false
                    this.run()
                }
            })
        }
    }

    track(tracker) {
        tracker.effect = this
        this.add(tracker)
    }

    pause() {
        // prevent scheduled effect from running
        this.microtask = false

        // dispose both trackers and nested effects / boundaries
        for (const entry of cleared(this)) {
            entry.dispose()
        }

        const outerContext = context
        try {
            context = null
            this.teardown?.()
            this.teardown = null
        } finally {
            context = outerContext
        }
    }

    dispose() {
        this.fn = null
        this.pause()
    }
}

export function effect(fn) {
    return new Effect(fn).run()
}

export class Boundary extends Set {
    constructor(fn, { orphaned = false } = {}) {
        super()
        this.fn = fn

        if (!orphaned) {
            context?.add(this)
        }
    }

    init() {
        if (this.fn) {
            const outerContext = context
            try {
                context = this
                this.fn()
                this.fn = null
            } finally {
                context = outerContext
            }
        }
        return this
    }

    dispose() {
        // dispose both trackers and nested effects / boundaries
        for (const entry of cleared(this)) {
            entry.dispose()
        }
    }
}

export function boundary(fn) {
    return new Boundary(fn).init()
}

export function untracked(fn) {
    const outerContext = context
    try {
        context = null
        fn()
    } finally {
        context = outerContext
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
