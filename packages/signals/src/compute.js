import { Effect } from './effect'
import { signal } from './signal'

/**
 * Creates a computed signal.
 * @param {() => *} fn - The function to compute the signal's value.
 * @returns {() => *} - A function that returns the current value of the computed signal.
 */
export function compute(fn) {
    let _signal = signal({ value: undefined })

    return () => {
        new Effect(() => (_signal.value = fn()), { async: false }).run()
        return _signal.value
    }
}
