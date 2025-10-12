import * as is from '../../checkers.js'

export function Attribute(node, ctx) {
    ctx.next()

    if (is.classAttribute(node, true) || is.idAttribute(node, true)) {
        node.metadata ??= {}
        node.metadata.isScoped = true
        return
    }
}
