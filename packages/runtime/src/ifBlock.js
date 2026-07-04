import { compute, Effect } from '@katabatic/signals'
import { AnimatedClient } from './client.js'

export class IfBlock {
    constructor(anchor, getCondition, concequent, alternate) {
        this.getCondition = compute(getCondition)
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
        this.#effect = new Effect(
            () => {
                console.log
                if (this.getCondition()) {
                    this.#altBlock?.out(() => this.#removeBlock(this.#altBlock))
                    this.#condBlock ??= this.#insertBlock(new Block(), this.concequent)
                    if (this.#effect) this.#condBlock.in()
                } else {
                    this.#condBlock?.out(() => this.#removeBlock(this.#condBlock))
                    if (this.alternate) {
                        this.#altBlock ??= this.#insertBlock(new Block(), this.alternate)
                        if (this.#effect) this.#altBlock.in()
                    }
                }
            },
            { orphaned: true }
        ).run()

        return this
    }

    run() {
        this.#effect.run()
    }

    pause() {
        this.#effect.pause()
        this.#condBlock?.pause()
        this.#altBlock?.pause()
    }

    dispose() {
        this.#effect.dispose()
        this.#condBlock?.dispose()
        this.#altBlock?.dispose()
    }
}

export function ifBlock(anchor, getCondition, concequent, alternate) {
    return new IfBlock(anchor, getCondition, concequent, alternate).init()
}

class Block extends AnimatedClient {
    get nextNode() {
        return this.anchor?.nextSibling
    }
}

function createHeadBlock(anchor) {
    const block = new Block()
    block.anchor = document.createComment('')
    anchor.parentNode.insertBefore(block.anchor, anchor)
    return block
}
