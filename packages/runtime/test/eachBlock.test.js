import { describe, expect, it } from 'vitest'
import { signal } from '@katabatic/signals'
import { setAsync } from '@katabatic/signals/tracker'
import { eachBlock } from '../src/eachBlock'

setAsync(false)

describe('eachBlock', () => {
    it('should render new item block when adding to the array', () => {
        const anchor = createAnchor()
        const array = signal(['bob'])

        eachBlock(
            anchor,
            () => array,
            (v, i) => i,
            ($, anchor, item) => {
                const text = document.createTextNode(item())
                anchor.parentNode.insertBefore(text, anchor)
            }
        )

        expect(anchor.previousSibling).toHaveTextContent('bob')
        array.push('jack')
        expect(anchor.previousSibling).toHaveTextContent('jack')
    })

    it('should trigger block effects when item changed', () => {
        const anchor = createAnchor()
        const value = signal({})
        value.array = [{ name: 'bob' }]

        eachBlock(
            anchor,
            () => value.array,
            (v, i) => i,
            ($, anchor, item) => {
                const text = document.createTextNode('')

                $.effect(() => {
                    text.textContent = item().name
                })

                anchor.parentNode.insertBefore(text, anchor)
            }
        )

        expect(anchor.previousSibling).toHaveTextContent('bob')
        value.array[0] = { name: 'jack' }
        expect(anchor.previousSibling).toHaveTextContent('jack')
        value.array = [{ name: 'bob' }]
        expect(anchor.previousSibling).toHaveTextContent('bob')
    })
})

function createAnchor() {
    const body = document.createElement('body')
    const anchor = document.createComment('')
    body.appendChild(anchor)

    return anchor
}
