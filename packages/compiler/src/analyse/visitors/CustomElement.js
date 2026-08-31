import * as is from '../../checkers.js'

export function CustomElement(node, ctx) {
    ctx.next()

    const hasClass = node.attributes.some(is.classAttribute)
    const hasExpressionAttribute = node.attributes.some(is.expressionAttribute)

    node.metadata ??= {}
    node.metadata.hasClass = hasClass
    node.metadata.hasExpressionAttribute = hasExpressionAttribute
}
