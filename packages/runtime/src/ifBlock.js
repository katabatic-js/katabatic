import { Effect } from '@drop/signals'
import { Client } from './client.js'

export class IfBlock {
    constructor(anchor, getCondition, concequent, alternate) {
        this.anchor = anchor
        this.getCondition = getCondition
        this.concequent = concequent
        this.alternate = alternate
        this.previousNode = anchor.previousSibling
        this.parentNode = this.previousNode ? undefined : anchor.parentNode
    }

    #block
    #effect

    #insertBlock(block, fn) {
        fn(block, this.anchor)
        this.block = block
    }

    #removeBlock() {
        if (this.block) {
            let node = this.previousNode?.nextSibling ?? this.parentNode.firstChild
            while (node !== this.anchor) {
                const nextNode = node.nextSibling
                node.remove()
                node = nextNode
            }

            this.block.dispose()
            this.block = undefined
        }
    }

    init() {
        let previousCondition

        this.#effect ??= new Effect(() => {
            const condition = this.getCondition()

            if (condition === previousCondition) return
            previousCondition = condition

            if (condition) {
                this.#removeBlock()
                this.#insertBlock(new Client(), this.concequent)
            } else {
                if (this.alternate) {
                    this.#removeBlock()
                    this.#insertBlock(new Client(), this.alternate)
                } else {
                    this.#removeBlock()
                }
            }
        }, true).run()

        return this
    }

    dispose() {
        this.#effect?.dispose()
        this.#block?.dispose()
    }
}

export function ifBlock(anchor, getCondition, concequent, alternate) {
    return new IfBlock(anchor, getCondition, concequent, alternate).init()
}