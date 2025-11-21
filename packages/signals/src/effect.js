export let track
let add

export class Effect extends Set {
    constructor(fn, { orphaned = false, async = true } = {}) {
        super()
        this.fn = fn
        this.async = async
        this.microtask = false

        if (!orphaned) {
            add?.(this)
        }
    }

    run() {
        if (this.fn) {
            // dispose both trackers and nested effects / boundaries
            for (const entry of cleared(this)) {
                entry.dispose()
            }

            const outerTrack = track
            const outerAdd = add
            try {
                track = null
                add = null
                this.teardown?.()

                track = this.track.bind(this)
                add = this.add.bind(this)
                this.teardown = this.fn()
            } finally {
                track = outerTrack
                add = outerAdd
            }
        }

        return this
    }

    schedule() {
        if (!this.microtask) {
            this.microtask = true
            queueMicrotask(() => {
                this.microtask = false
                this.run()
            })
        }
    }

    track(tracker) {
        tracker.effect = this
        this.add(tracker)
    }

    dispose() {
        this.fn = null

        // dispose both trackers and nested effects / boundaries
        for (const entry of cleared(this)) {
            entry.dispose()
        }

        const outerTrack = track
        const outerAdd = add
        try {
            track = null
            add = null
            this.teardown?.()
        } finally {
            track = outerTrack
            add = outerAdd
        }
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
            add?.(this)
        }
    }

    init() {
        if (this.fn) {
            const outerTrack = track
            const outerAdd = add
            try {
                track = null
                add = this.add.bind(this)
                this.fn()
                this.fn = null
            } finally {
                track = outerTrack
                add = outerAdd
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
    const outerTrack = track
    const outerAdd = add
    try {
        track = null
        add = null
        fn()
    } finally {
        track = outerTrack
        add = outerAdd
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
