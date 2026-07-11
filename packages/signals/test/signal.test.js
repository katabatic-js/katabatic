import { describe, expect, it } from 'vitest'
import { effect, Signal } from '../src/index.js'
import { setAsync } from '../src/tracker.js'

setAsync(false)

describe('Signal', () => {
    describe('with observed properties', () => {
        it('should trigger effect', () => {
            class Profile extends Signal {
                static observedProperties = ['name', 'age']

                constructor() {
                    super()
                    this.age = 30
                }

                setName(name) {
                    this.name = name
                }
            }

            const profile = new Profile()

            let name
            let age
            effect(() => {
                name = profile.name
                age = profile.age
            })

            expect(name).toBe(undefined)
            expect(age).toBe(30)

            profile.setName('bob')
            expect(name).toBe('bob')

            profile.age = 35
            expect(age).toBe(35)
        })
    })

    describe('with observed property conflicting with instance property', () => {
        class Profile extends Signal {
            static observedProperties = ['name']

            name = 'bob'
        }

        it('should throw an error', () => {
            expect(() => new Profile()).toThrowError()
        })
    })

    describe('with observed property conflicting with class getter, setter or method', () => {
        class Profile extends Signal {
            static observedProperties = ['name']

            set name(value) {
            }

            get name() {}
        }

        it('should throw an error', () => {
            expect(() => new Profile()).toThrowError()
        })
    })
})
