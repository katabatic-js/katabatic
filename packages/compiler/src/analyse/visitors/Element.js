import * as is from '../../checkers.js'

export function Element(node, ctx) {
    ctx.next()

    const hasClass = node.attributes.some(is.classAttribute)

    node.metadata ??= {}
    node.metadata.hasClass = hasClass
}
