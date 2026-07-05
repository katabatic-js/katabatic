import * as b from '../../../builders.js'
import { appendExpression } from '../../../utils/template.js'
import { nextBlockId } from '../../context.js'

export function EachBlock(node, ctx) {
    const template = { text: [''], expressions: [] }

    ctx.visit(node.body, { ...ctx.state, template })

    const blockId = nextBlockId(ctx)
    const resultId = b.id('_result')
    const block = b.func(blockId, [
        b.declaration(resultId, b.literal(''), 'let'),
        b.forStmt(node.context, node.expression, [
            b.assignment(resultId, b.template(template), '+=')
        ]),
        b.returnStmt(resultId)
    ])

    ctx.state.blocks.push(block)
    appendExpression(ctx.state.template, b.call(blockId))
}
