export function Text(node, ctx) {
    ctx.state.text.push(node.data)
}
