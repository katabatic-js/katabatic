import * as b from '../../builders.js'

export function Identifier(node, ctx) {
    if (node.metadata?.isBlockVar) {
        return b.call(node)
    }
    if (node.metadata?.isProperty || node.metadata?.isMethod) {
        if (ctx.state.context.hot) {
            return b.thisMember(node.metadata?.isPrivate ? b.id(`___${node.name}`) : node)
        }
        return b.thisMember(b.id(node, node.metadata?.isPrivate))
    }
}
