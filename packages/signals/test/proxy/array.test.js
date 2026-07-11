import { describe, expect, it } from 'vitest'
import { signal } from '../../src/signal.js'
import { effect } from '../../src/effect.js'
import { setAsync } from '../../src/tracker.js'

setAsync(false)

describe('signal(array)', () => {
    describe('length', () => {
        it('should trigger effect when muttating the array', () => {
            const names = signal(['bob'])

            let length
            effect(() => {
                length = names.length
            })

            expect(length).toBe(1)
            names.push('jack')
            expect(length).toBe(2)
        })
    })

    describe('iterator', () => {
        it('should trigger effect when muttating the array', () => {
            const names = signal(['bob'])

            let name
            effect(() => {
                for (const n of names) {
                    name = n
                }
            })

            expect(name).toBe('bob')
            names.push('jack')
            expect(name).toBe('jack')
        })
    })

    describe('with callback accessor', () => {
        it("should trigger effect when setting an item's property", () => {
            const names = signal([{ first: 'bob' }])

            let name
            effect(() => {
                name = names.find((n) => n.first === 'jack')
            })

            expect(name).toBe(undefined)
            names[0].first = 'jack'
            expect(name).toEqual({ first: 'jack' })
        })

        it('should trigger effect when setting an item by index', () => {
            const names = signal(['bob'])

            let name
            effect(() => {
                name = names.find((n) => n === 'jack')
            })

            expect(name).toBe(undefined)
            names[0] = 'jack'
            expect(name).toBe('jack')
        })
    })

    describe('with mutation inside effect', () => {
        it('should not result in an infinite loop', () => {
            const names = signal(['bob', 'jack'])

            let name
            effect(() => {
                names.reverse()
                name = names[0]
            })

            expect(name).toBe('jack')
        })
    })
})
