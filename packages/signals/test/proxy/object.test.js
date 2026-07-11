import { describe, expect, it } from 'vitest'
import { signal } from '../../src/signal.js'
import { effect } from '../../src/effect.js'
import { setAsync } from '../../src/tracker.js'

setAsync(false)

describe('signal(object)', () => {
    it('should trigger effect when setting a property', () => {
        const profile = signal({ name: 'bob' })

        let name
        effect(() => {
            name = profile.name
        })

        expect(name).toBe('bob')
        profile.name = 'jack'
        expect(name).toBe('jack')
    })

    it('should trigger effect when deleting a property', () => {
        const profile = signal({ name: 'bob' })

        let name
        effect(() => {
            name = profile.name
        })
        expect(name).toBe('bob')
        delete profile.name
        expect(name).toBe(undefined)
    })

    it('should trigger effect when setting a nested property', () => {
        const profile = signal({})

        let first
        effect(() => {
            first = profile.name?.first
        })

        expect(first).toBe(undefined)
        profile.name = { first: 'bob' }
        expect(first).toBe('bob')
        profile.name.first = 'jack'
        expect(first).toBe('jack')
    })

    it('should accept arbitrary property type', () => {
        const profile = signal({ name: new Map([['first', 'bob']]) })

        let first
        effect(() => {
            first = profile.name.get('first')
        })

        expect(first).toBe('bob')
        profile.name.set('first', 'jack')
        expect(first).toBe('bob')
        profile.name = new Map([['first', 'jack']])
        expect(first).toBe('jack')
    })
})
