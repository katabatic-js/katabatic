import * as b from '../../builders.js'

export function AssignmentExpression(node) {
    if (node.metadata?.isProperty && !node.metadata?.isPrivate) {
        return { ...node, right: b.$$init(node.left.property.name, node.right) }
    }
}
