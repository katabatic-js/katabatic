import * as b from '../../builders.js'
import { transformQuerySelector } from '../../css-transform.js'

export function CallExpression(node, ctx) {
    ctx.next()

    if (node.metadata?.isGetElementById && node.metadata?.isScoped) {
        const id = node.arguments[0].value
        return { ...node, arguments: [b.literal(id + '-' + ctx.state.context.hash)] }
    }

    if (node.metadata?.isQuerySelector && node.metadata?.isScoped) {
        const selectorList = node.metadata.selectorList
        const query = transformQuerySelector(selectorList, ctx.state.context)
        return { ...node, arguments: [b.literal(query)] }
    }
}
