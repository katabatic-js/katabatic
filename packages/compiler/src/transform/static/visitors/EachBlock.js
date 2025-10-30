import * as b from '../../../builders.js'
import { nextBlockId } from '../../context.js'

export function EachBlock(node, ctx) {
    const text = ['']
    const expressions = []

    ctx.visit(node.body, { ...ctx.state, text, expressions })

    const blockId = nextBlockId(ctx)
    const resultId = b.id('result_')
    const block = b.func(blockId, [
        b.declaration(resultId, b.literal(''), 'let'),
        b.forStmt(node.context, node.expression, [
            b.assignment(resultId, b.template({ text, expressions }), '+=')
        ]),
        b.returnStmt(resultId)
    ])

    ctx.state.blocks.push(block)
    ctx.state.text.push('')
    ctx.state.expressions.push(b.call(blockId))
}
