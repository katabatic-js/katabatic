export function getStyleSheet(ctx) {
    const root = ctx.path[0]
    return root.template.fragment.nodes.find((n) => n.type === 'Style')?.content
}

export function getTemplate(ctx) {
    const root = ctx.path[0]
    return root.template
}

export function getProgram(ctx) {
    const root = ctx.path[0]
    return root.script.content
}

export function getScript(ctx) {
    return ctx.path.toReversed().find((n) => n.type === 'Script')
}

export function getBlocks(ctx) {
    return ctx.path.toReversed().filter((n) => n.type === 'EachBlock')
}

export function isInConstructor(ctx) {
    for (const node of ctx.path.toReversed()) {
        if (node.type === 'ArrowFunctionExpression') return false
        if (node.type === 'FunctionDeclaration') return false
        if (node.type === 'MethodDefinition') return node.kind === 'constructor'
    }
    return false
}
