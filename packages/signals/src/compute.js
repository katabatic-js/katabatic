import { Effect } from './effect'
import { signal } from './signal'

export function compute(fn) {
    let _signal = signal({ value: undefined })

    return () => {
        new Effect(() => (_signal.value = fn()), { async: false }).run()
        return _signal.value
    }
}
