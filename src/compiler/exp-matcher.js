import { walk } from 'zimmerframe'

export function matchExpression(expression, program, blocks) {
    let customElement = program.metadata?.customElement

    walk(expression, undefined, {
        Identifier(node, ctx) {
            const parentNode = ctx.path.at(-1)

            switch (parentNode?.type) {
                case 'CallExpression':
                    if (parentNode.callee === node) {
                        setMethodMetadata(node)
                    } else {
                        setMetadata(node)
                    }
                    break
                case 'MemberExpression':
                    if (parentNode.object === node) {
                        setMetadata(node)
                    }
                    break
                default:
                    setMetadata(node)
            }
        }
    })

    function setMethodMetadata(node) {
        node.metadata ??= {}

        if (customElement.methods.includes(node.name)) {
            node.metadata.isPrivate = false
            node.metadata.isMethod = true
            return
        }

        if (customElement.private.methods.includes(node.name)) {
            node.metadata.isPrivate = true
            node.metadata.isMethod = true
            return
        }
    }

    function setMetadata(node) {
        node.metadata ??= {}

        if (blocks.some((b) => b.context?.name === node.name)) {
            node.metadata.isBlockVar = true
            return
        }

        if (customElement.properties.includes(node.name)) {
            node.metadata.isPrivate = false
            node.metadata.isProperty = true
            return
        }

        if (customElement.private.properties.includes(node.name)) {
            node.metadata.isPrivate = true
            node.metadata.isProperty = true
            return
        }
    }
}
