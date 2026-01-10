import * as b from '../../builders.js'

export function PrivateIdentifier(node, ctx) {
    if (ctx.state.context.hot) {
        return b.id(`___${node.name}`)
    }
}
