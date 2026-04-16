import { effect } from './effect'
import { signal } from './signal'

export function compute(fn) {
    let _signal = signal({ value: undefined })

    return () => {
        effect(() => (_signal.value = fn()))
        return _signal.value
    }
}
