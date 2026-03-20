import { expect, test } from 'vitest'
import { effect, Signal } from '../src/index.js'
import { setAsync } from '../src/tracker.js'

setAsync(false)

test('signal', () => {
    const data = new ObjectSignal()


    let name
    effect(() => {
        name = data.name
    })

    expect(name).toBe(undefined)
    data.doStuff()
    expect(name).toBe('ii')
})

class ObjectSignal extends Signal {
    static observedProperties = ['name']

    doStuff() {
        this.name = 'ii'
    }
}