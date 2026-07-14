let context

/**
 * Register a tracker if an effect is present in the execution context.
 * @param {() => import("./tracker").Tracker} fn - A function that returns a Tracker instance.
 */
export function track(fn) {
    context?.track?.(fn())
}

/**
 * An effect tracks events dispatched by signals.
 * It re-runs the provided function whenever a tracker is triggered.
 */
export class Effect extends Set {
    /**
     * Creates an instance of the Effect class.
     * @param {() => {}} fn - The function to run when the effect is triggered.
     * @param {Object} options - The options for the effect.
     * @param {boolean} options.orphaned - Whether the effect is orphaned. Default is false.
     * @param {boolean} options.async - Whether the effect is asynchronous. Default is true.
     */
    constructor(fn, { orphaned = false, async = true } = {}) {
        super()
        this.fn = fn
        this.async = async
        this.microtask = false

        if (!orphaned) {
            context?.add(this)
        }
    }

    /**
     * Runs the effect. This must be called at least once to bootstrap the tracking process.
     * @returns {this} - The current instance of the Effect class.
     */
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

    /**
     * Schedules the effect to run in the next microtask.
     */
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

    /**
     * Registers a tracker with the effect.
     * This method is not intended to be called directly. Instead, use the `track` function to register trackers.
     * @param {import("./tracker").Tracker} tracker - The tracker to register with the effect.
     */
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

    /**
     * Disposes the effect, stopping it from tracking any further events.
     * This method should be called when the effect is no longer needed to prevent memory leaks.
     * Only the outermost effect or boundary needs to be disposed to stop tracking events.
     */
    dispose() {
        this.fn = null
        this.pause()
    }
}

/**
 * Creates a new effect and runs it immediately.
 * @param {() => {}} fn - The function to run when the effect is triggered.
 * @returns {Effect} - The created effect.
 */
export function effect(fn) {
    return new Effect(fn).run()
}

/**
 * A boundary prevents parent effects from tracking events dispatched by signals within the boundary.
 */
export class Boundary extends Set {
    /**
     * Creates a new boundary.
     * @param {() => {}} fn - The function to run when the boundary is initialized.
     * @param {Object} options - Additional options for the boundary.
     * @param {boolean} options.orphaned - Whether the boundary is orphaned.
     */
    constructor(fn, { orphaned = false } = {}) {
        super()
        this.fn = fn

        if (!orphaned) {
            context?.add(this)
        }
    }

    /**
     * Initializes the boundary and runs the provided function.
     * @returns {this} - The current instance of the Boundary class.
     */
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

    /**
     * Disposes the boundary.
     * This method should be called when the boundary is no longer needed to prevent memory leaks.
     * Only the outermost boundary or effect needs to be disposed to stop tracking events.
     */
    dispose() {
        // dispose both trackers and nested effects / boundaries
        for (const entry of cleared(this)) {
            entry.dispose()
        }
    }
}

/**
 * Creates a new boundary and initializes it.
 * @param {() => {}} fn - The function to run when the boundary is initialized.
 * @returns {Boundary} - The created boundary.
 */
export function boundary(fn) {
    return new Boundary(fn).init()
}

/**
 * Runs the provided function without tracking any signals.
 * @param {() => *} fn - The function to run without tracking.
 * @returns {*} - The return value of the provided function.
 */
export function untracked(fn) {
    const outerContext = context
    try {
        context = null
        return fn()
    } finally {
        context = outerContext
    }
}

const cleared = (self) => {
    const entries = [...self]
    self.clear()
    return entries
}
