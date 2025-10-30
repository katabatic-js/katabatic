export function ClassDeclaration(node, ctx) {
    ctx.next()

    ctx.state.customElement.className = node.id.name
}
