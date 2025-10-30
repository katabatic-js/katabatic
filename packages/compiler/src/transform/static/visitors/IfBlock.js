import * as b from '../../../builders.js'
import { nextBlockId } from '../../context.js'

export function IfBlock(node, ctx) {
    const text = ['']
    const expressions = []

    ctx.visit(node.consequent, { ...ctx.state, text, expressions })
    const stmt1 = b.returnStmt(b.template({ text, expressions }))

    let stmt2
    if (node.alternate) {
        const text = ['']
        const expressions = []

        ctx.visit(node.alternate, { ...ctx.state, text, expressions })
        stmt2 = b.returnStmt(b.template({ text, expressions }))
    } else {
        stmt2 = b.returnStmt(b.literal(''))
    }

    const blockId = nextBlockId(ctx)
    const block = b.func(blockId, [b.ifStmt(node.test, [stmt1]), stmt2])

    ctx.state.blocks.push(block)
    ctx.state.text.push('')
    ctx.state.expressions.push(b.call(blockId))
}
