import * as is from '../../checkers.js'

export function MethodDefinition(node, ctx) {
    ctx.next()

    const isPrivate = is.privateId(node.key)
    const customElement = isPrivate ? ctx.state.customElement.private : ctx.state.customElement

    node.metadata ??= {}
    node.metadata.isPrivate = isPrivate

    if (node.kind === 'method') {
        customElement.methods.push(node.key.name)
    } else if (node.kind === 'set') {
        customElement.setters.push(node.key.name)
    }
}
