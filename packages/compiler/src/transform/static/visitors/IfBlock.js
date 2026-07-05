import * as b from '../../../builders.js'
import { appendExpression } from '../../../utils/template.js'
import { nextBlockId } from '../../context.js'

export function IfBlock(node, ctx) {
    const template = { text: [''], expressions: [] }

    ctx.visit(node.consequent, { ...ctx.state, template })
    const stmt1 = b.returnStmt(b.template(template))

    let stmt2
    if (node.alternate) {
        const template = { text: [''], expressions: [] }

        ctx.visit(node.alternate, { ...ctx.state, template })
        stmt2 = b.returnStmt(b.template(template))
    } else {
        stmt2 = b.returnStmt(b.literal(''))
    }

    const blockId = nextBlockId(ctx)
    const block = b.func(blockId, [b.ifStmt(node.test, [stmt1]), stmt2])

    ctx.state.blocks.push(block)
    appendExpression(ctx.state.template, b.call(blockId))
}
