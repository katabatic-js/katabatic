export function ExpressionTag(node, ctx) {
    node = ctx.next() ?? node

    ctx.state.text.push('')
    ctx.state.expressions.push(node.expression)
}
