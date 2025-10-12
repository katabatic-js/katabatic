import * as b from '../../builders.js'

export function Identifier(node) {
    if (node.metadata?.isBlockVar) {
        return b.call(node)
    }
    if (node.metadata?.isProperty || node.metadata?.isMethod) {
        return b.thisMember(b.id(node, node.metadata?.isPrivate))
    }
}
