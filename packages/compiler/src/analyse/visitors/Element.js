import * as is from '../../checkers.js'

export function Element(node, ctx) {
    ctx.next()

    const isVoid = is.voidElement(node)
    const hasClass = node.attributes.some(is.classAttribute)
    const hasExpressionAttribute = node.attributes.some(is.expressionAttribute)

    node.metadata ??= {}
    node.metadata.isVoid = isVoid
    node.metadata.hasClass = hasClass
    node.metadata.hasExpressionAttribute = hasExpressionAttribute
}
