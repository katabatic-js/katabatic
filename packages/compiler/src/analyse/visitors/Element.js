import * as is from '../../checkers.js'

export function Element(node, ctx) {
    ctx.next()

    const hasClass = node.attributes.some(is.classAttribute)

    const bindAttribute = node.attributes.find(is.bindAttribute)
    const hasBinding = !!bindAttribute
    const bindExpression = bindAttribute?.value[0].expression

    node.metadata ??= {}
    node.metadata.hasClass = hasClass
    node.metadata.hasBinding = hasBinding
    node.metadata.bindExpression = bindExpression
}
