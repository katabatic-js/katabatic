import * as is from '../../checkers.js'
import { getElement } from '../context.js'

export function Attribute(node, ctx) {
    ctx.next()

    const element = getElement(ctx)
    const isProperty = is.propertyAttribute(node, element)
    const isBoolean = is.booleanAttribute(node)
    const isScoped = is.classAttribute(node, true) || is.idAttribute(node, true)

    node.metadata ??= {}
    node.metadata.isProperty = isProperty
    node.metadata.isBoolean = isBoolean
    node.metadata.isScoped ||= isScoped
}
