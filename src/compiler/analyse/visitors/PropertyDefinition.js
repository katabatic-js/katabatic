import * as is from '../../checkers.js'

export function PropertyDefinition(node, ctx) {
    if (!node.static) {
        const isPrivate = is.privateId(node.key)
        const customElement = isPrivate ? ctx.state.customElement.private : ctx.state.customElement

        node.metadata ??= {}
        node.metadata.isPrivate = isPrivate
        customElement.properties.push(node.key.name)
    }
}
