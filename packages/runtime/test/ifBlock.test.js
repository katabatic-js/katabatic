import { describe, expect, it } from 'vitest'
import { signal } from '@katabatic/signals'
import { setAsync } from '@katabatic/signals/tracker'
import { ifBlock } from '../src/ifBlock'

setAsync(false)

describe('ifBlock', () => {
    it('should render concequent block', () => {
        const anchor = createAnchor()
        const test = signal({ value: false })

        ifBlock(
            anchor,
            () => test.value,
            ($, anchor) => {
                const text = document.createTextNode('concequent')
                anchor.parentNode.insertBefore(text, anchor)
            }
        )

        expect(anchor.previousSibling?.nodeType).toBe(Node.COMMENT_NODE)
        test.value = true
        expect(anchor.previousSibling).toHaveTextContent('concequent')
    })

    it('should render alternate block', () => {
        const anchor = createAnchor()
        const test = signal({ value: false })

        ifBlock(
            anchor,
            () => test.value,
            ($, anchor) => {
                const text = document.createTextNode('concequent')
                anchor.parentNode.insertBefore(text, anchor)
            },
            ($, anchor) => {
                const text = document.createTextNode('alternate')
                anchor.parentNode.insertBefore(text, anchor)
            }
        )

        expect(anchor.previousSibling).toHaveTextContent('alternate')
        test.value = true
        expect(anchor.previousSibling).toHaveTextContent('concequent')
    })

    it('should dispose unmatched branch block immediately', () => {
        const anchor = createAnchor()
        const test = signal({ value: true })

        let value

        ifBlock(
            anchor,
            () => test.value,
            ($, anchor) => {
                const text = document.createTextNode('concequent')

                $.effect(() => {
                    value = test.value
                })

                anchor.parentNode.insertBefore(text, anchor)
            }
        )

        expect(anchor.previousSibling).toHaveTextContent('concequent')
        expect(value).toEqual(true)
        test.value = false
        expect(anchor.previousSibling?.nodeType).toBe(Node.COMMENT_NODE)
        expect(value).toEqual(true)
    })
})

describe('ifBlock with animation', () => {
    it('should dispose unmatched branch block immediately', () => {
        const anchor = createAnchor()
        const test = signal({ value: true })

        let value

        ifBlock(
            anchor,
            () => test.value,
            ($, anchor) => {
                const element = document.createElement('div')
                element.textContent = 'concequent'

                $.animate('out', (o) => fade(element, { duration: 100 }, o))

                $.effect(() => {
                    value = test.value
                })

                anchor.parentNode.insertBefore(element, anchor)
            }
        )

        expect(anchor.previousSibling).toHaveTextContent('concequent')
        expect(value).toEqual(true)
        test.value = false
        expect(anchor.previousSibling).toHaveTextContent('concequent')
        expect(value).toEqual(true)
    })
})

function createAnchor() {
    const body = document.createElement('body')
    const anchor = document.createComment('')
    body.appendChild(anchor)

    return anchor
}

function fade(element, { duration = 1000 } = {}, { direction = 'in' } = {}) {
    return element.animate(
        [{ opacity: direction === 'out' ? 1 : 0 }, { opacity: direction === 'out' ? 0 : 1 }],
        {
            duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        }
    )
}
