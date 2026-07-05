import * as b from '../../../builders.js'
import { appendExpression } from '../../../utils/template.js'
import { nextBlockId } from '../../context.js'

export function IfBlock(node, ctx) {
    function branchStmt(node) {
        if (node) {
            const template = { text: [''], expressions: [] }

            ctx.visit(node, { ...ctx.state, template })
            return b.returnStmt(b.template(template))
        }
        return b.returnStmt(b.literal(''))
    }

    const testStmt = ctx.visit(node.test)
    const consequentStmt = branchStmt(node.consequent)
    const alternateStmt = branchStmt(node.alternate)

    const blockId = nextBlockId(ctx)
    const blockStmt = b.func(blockId, [b.ifStmt(testStmt, [consequentStmt]), alternateStmt])

    ctx.state.blocks.push(blockStmt)
    appendExpression(ctx.state.template, b.call(blockId))
}
