import { describe, expect, it } from 'vitest'
import { matchSelector } from '../src/css-matcher'

function TEMPLATE() {
    return {
        type: 'Template',
        attributes: [],
        fragment: {
            type: 'Fragment',
            nodes: [
                {
                    type: 'Element',
                    name: 'button',
                    attributes: [
                        {
                            type: 'Attribute',
                            name: 'class',
                            value: [{ type: 'Text', data: 'active valid' }]
                        }
                    ],
                    fragment: { type: 'Fragment', nodes: [] }
                }
            ]
        }
    }
}

describe('matchSelector()', () => {
    describe('with TypeSelector', () => {
        it('should match element', () => {
            const match = matchSelector(
                {
                    type: 'Selector',
                    children: [{ type: 'TypeSelector', name: 'button' }]
                },
                TEMPLATE()
            )

            expect(match).toBe(true)
        })
    })

    describe('with ClassSelectors', () => {
        it('should match element with all specified class', () => {
            const match = matchSelector(
                {
                    type: 'Selector',
                    children: [
                        { type: 'ClassSelector', name: 'active' },
                        { type: 'ClassSelector', name: 'valid' }
                    ]
                },
                TEMPLATE()
            )

            expect(match).toBe(true)
        })

        it('should not match element with missing class', () => {
            const match = matchSelector(
                {
                    type: 'Selector',
                    children: [
                        { type: 'ClassSelector', name: 'active' },
                        { type: 'ClassSelector', name: 'invalid' }
                    ]
                },
                TEMPLATE()
            )

            expect(match).toBe(false)
        })
    })

    describe('with PseudoClassSelector only', () => {
        it('should match all elements', () => {
            const match = matchSelector(
                {
                    type: 'Selector',
                    children: [{ type: 'PseudoClassSelector', name: 'hover' }]
                },
                TEMPLATE()
            )

            expect(match).toBe(true)
        })
    })

    describe('with TypeSelector and PseudoClassSelector', () => {
        it('should match specific element', () => {
            const match = matchSelector(
                {
                    type: 'Selector',
                    children: [
                        { type: 'TypeSelector', name: 'button' },
                        { type: 'PseudoClassSelector', name: 'hover' }
                    ]
                },
                TEMPLATE()
            )

            expect(match).toBe(true)
        })

        it('should not match unspecified elements', () => {
            const match = matchSelector(
                {
                    type: 'Selector',
                    children: [
                        { type: 'TypeSelector', name: 'span' },
                        { type: 'PseudoClassSelector', name: 'hover' }
                    ]
                },
                TEMPLATE()
            )

            expect(match).toBe(false)
        })
    })
})
