import * as b from '../../../builders.js'

export function Identifier(node, ctx) {
    if (node.metadata?.isData) {
        return b.member(b.id('data'), node)
    }
}
