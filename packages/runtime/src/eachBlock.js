import { Signal, SignalEvent, Effect, track } from '@katabatic/signals'
import { Tracker } from '@katabatic/signals/tracker'
import { AnimatedClient } from './client.js'

export class EachBlock extends Map {
    constructor(anchor, getIterable, getKey, fn) {
        super()
        this.getIterable = getIterable
        this.getKey = getKey
        this.fn = fn
        this.#head = createHeadBlock(anchor)
    }

    #head
    #effect

    #insertBlockAfter(block, tail) {
        const anchor = tail.nextNode
        this.fn(block, anchor, block.getValue)
        block.anchor = anchor.previousSibling

        tail.insertAfter(block)
        this.set(block.key, block)

        return block
    }

    #moveBlockAfter(block, tail) {
        if (block === tail) return block

        const anchor = tail.nextNode
        let node = block.previousBlock.nextNode
        while (true) {
            const nextNode = node.nextSibling
            anchor.parentNode.insertBefore(node, anchor)

            if (node === block.anchor) break
            node = nextNode
        }

        tail.insertAfter(block)
        return block
    }

    #removeBlock(block) {
        let node = block.previousBlock.nextNode
        while (true) {
            const nextNode = node.nextSibling
            node.remove()

            if (node === block.anchor) break
            node = nextNode
        }

        block.dispose()
        block.remove()
        this.delete(block.key)
    }

    *#getRemovedBlocks(iterable) {
        const keys = new Set(iterable.map((v, i) => this.getKey(v, i)))

        for (const block of this.values()) {
            if (!keys.has(block.key)) yield block
        }
    }

    init() {
        this.#effect ??= new Effect(() => {
            const iterable = this.getIterable()

            for (const block of this.#getRemovedBlocks(iterable)) {
                this.#removeBlock(block)
            }

            let tail = this.#head
            let index = 0
            for (const item of iterable) {
                const key = this.getKey(item, index)
                let block = this.get(key)

                if (block) {
                    if (tail.nextBlock === block) {
                        tail = updateBlock(block, item)
                    } else {
                        tail = updateBlock(this.#moveBlockAfter(block, tail), item)
                    }
                } else {
                    tail = this.#insertBlockAfter(new Block(key, item), tail)
                    if (this.#effect) tail.runAnimate('in')
                }

                index++
            }
        }, { orphaned: true, async: false }).run()

        return this
    }

    dispose() {
        this.#effect?.dispose()
        for (const entry of cleared(this)) {
            entry.dispose()
        }
    }
}

function updateBlock(block, value) {
    block.setValue(value)
    return block
}

export function eachBlock(anchor, getIterable, getKey, body) {
    return new EachBlock(anchor, getIterable, getKey, body).init()
}

class Block extends AnimatedClient {
    constructor(key, value) {
        super()
        this.key = key
        this.value = value
        this.signal = new Signal(undefined, this)
    }

    /** @type {Node} */
    anchor
    /** @type {Node} */
    parentAnchor

    setValue(nextValue) {
        const hasChange = this.value !== nextValue
        this.value = nextValue
        if (hasChange) {
            this.signal.dispatchEvent(new SignalEvent('change'))
        }
    }

    getValue = () => {
        track?.(new Tracker(this.signal))
        return this.value
    }

    insertAfter(block) {
        if (block.previousBlock) {
            block.previousBlock.nextBlock = block.nextBlock
        }
        if (block.nextBlock) {
            block.nextBlock.previousBlock = block.previousBlock
        }
        if (this.nextBlock) {
            this.nextBlock.previousBlock = block
        }
        block.previousBlock = this
        block.nextBlock = this.nextBlock
        this.nextBlock = block
    }

    remove() {
        if (this.previousBlock) {
            this.previousBlock.nextBlock = this.nextBlock
        }
        if (this.nextBlock) {
            this.nextBlock.previousBlock = this.previousBlock
        }
        this.previousBlock = undefined
        this.nextBlock = undefined
    }

    get nextNode() {
        return this.anchor?.nextSibling ?? this.parentAnchor.firstChild
    }
}

function createHeadBlock(anchor) {
    const block = new Block()
    block.anchor = anchor.previousSibling
    block.parentAnchor = block.anchor ? undefined : anchor.parentNode
    return block
}

const cleared = (self) => {
    const entries = [...self.values()]
    self.clear()
    return entries
}
