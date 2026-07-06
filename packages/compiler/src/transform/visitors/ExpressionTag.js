import * as b from '../../builders.js'
import { appendExpression } from '../../utils/template.js'

export function ExpressionTag(node, ctx) {
    node = ctx.next() ?? node

    let expression = node.expression
    if (ctx.state.pretty ?? true) {
        expression = b.logical('??', expression, b.literal(''))
    }
    appendExpression(ctx.state.template, expression)
}
