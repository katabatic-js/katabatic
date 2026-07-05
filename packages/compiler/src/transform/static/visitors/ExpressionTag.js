import * as b from '../../../builders.js'
import { appendExpression } from '../../../utils/template.js'

export function ExpressionTag(node, ctx) {
    node = ctx.next() ?? node

    appendExpression(ctx.state.template, b.logical('??', node.expression, b.literal('')))
}
