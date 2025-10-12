import { expect, test } from 'vitest'
import { effect, signal } from '../src/index.js'
import { setAsync } from '../src/tracker.js'

setAsync(false)

test('array', () => {
    const array = signal([1, 2, 3])

    let length
    effect(() => {
        length = array.length
    })

    expect(length).toBe(3)
    array.push(4)
    expect(length).toBe(4)
})

test('array', () => {
    const array = signal([{ val: 1 }, { val: 2 }, { val: 3 }])

    array.push(array[0])
})
