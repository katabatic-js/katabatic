export function ExpressionTag(node, ctx) {
    node = ctx.next() ?? node

    if (ctx.state.text.length == 0) {
        // template literals must start with a text
        ctx.state.text.push('')
    }
    ctx.state.expressions.push(node.expression)
}
