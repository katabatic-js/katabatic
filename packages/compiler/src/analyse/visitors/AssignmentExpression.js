import * as is from '../../checkers.js'
import { isInConstructor } from '../context.js'

export function AssignmentExpression(node, ctx) {
    if (is.thisMember(node.left) && isInConstructor(ctx)) {
        const isPrivate = is.privateId(node.left.property)
        const customElement = isPrivate ? ctx.state.customElement.private : ctx.state.customElement

        node.metadata ??= {}
        node.metadata.isPrivate = isPrivate
        node.metadata.isProperty = true
        customElement.properties.push(node.left.property.name)
    }
}
