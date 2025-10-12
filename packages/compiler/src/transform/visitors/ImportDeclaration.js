import path from 'path'

export function ImportDeclaration(node, ctx) {
    if (ctx.state.context.importShift && node.source.value[0] === '.') {
        const value = path.join(ctx.state.context.importShift, node.source.value)
        const raw = undefined

        return { ...node, source: { ...node.source, value, raw } }
    }
}
