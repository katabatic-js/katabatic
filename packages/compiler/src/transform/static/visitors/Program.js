import * as b from '../../../builders.js'

export function Program(node, ctx) {
    node = ctx.next() ?? node

    const stmt = b.exp(
        b.render([
            ...ctx.state.template.blocks,
            b.returnStmt(b.template(ctx.state.template.template))
        ])
    )
    return { ...node, body: [...node.body, stmt] }
}
