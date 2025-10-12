export function ClassDeclaration(node, ctx) {
    ctx.next()

    ctx.state.customElement.className[0] = node.id.name
}
