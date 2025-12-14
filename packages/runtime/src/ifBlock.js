import { Effect } from '@katabatic/signals'
import { AnimatedClient } from './client.js'

export class IfBlock {
    constructor(anchor, getCondition, concequent, alternate) {
        this.getCondition = getCondition
        this.concequent = concequent
        this.alternate = alternate
        this.#headBlock = createHeadBlock(anchor)
    }

    #headBlock
    #condBlock
    #altBlock
    #effect

    #insertBlock(block, fn) {
        const alternate = fn === this.alternate
        const previousBlock = alternate ? this.#condBlock ?? this.#headBlock : this.#headBlock
        const anchor = previousBlock.nextNode

        fn(block, anchor)
        block.anchor = anchor.previousSibling

        return block
    }

    #removeBlock(block) {
        const alternate = block === this.#altBlock
        const previousBlock = alternate ? this.#condBlock ?? this.#headBlock : this.#headBlock

        let node = previousBlock.nextNode
        while (true) {
            const nextNode = node.nextSibling
            node.remove()

            if (node === block.anchor) break
            node = nextNode
        }

        block.dispose()
        this.#condBlock = alternate ? this.#condBlock : undefined
        this.#altBlock = alternate ? undefined : this.#altBlock
    }

    init() {
        let previousCondition

        this.#effect ??= new Effect(
            () => {
                const condition = this.getCondition()

                if (condition === previousCondition) return
                previousCondition = condition

                if (condition) {
                    this.#altBlock?.runAnimate('out', () => this.#removeBlock(this.#altBlock))
                    this.#condBlock ??= this.#insertBlock(new Block(), this.concequent)
                    if (this.#effect) this.#condBlock.runAnimate('in')
                } else {
                    this.#condBlock?.runAnimate('out', () => this.#removeBlock(this.#condBlock))
                    if (this.alternate) {
                        this.#altBlock ??= this.#insertBlock(new Block(), this.alternate)
                        if (this.#effect) this.#altBlock.runAnimate('in')
                    }
                }
            },
            { orphaned: true, async: false }
        ).run()

        return this
    }

    dispose() {
        this.#effect?.dispose()
        this.#condBlock?.dispose()
    }
}

export function ifBlock(anchor, getCondition, concequent, alternate) {
    return new IfBlock(anchor, getCondition, concequent, alternate).init()
}

class Block extends AnimatedClient {
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
