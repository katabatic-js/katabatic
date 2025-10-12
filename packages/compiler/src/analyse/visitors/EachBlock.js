import { matchExpression } from '../../exp-matcher.js'
import { getBlocks, getProgram } from '../context.js'

export function EachBlock(node, ctx) {
    ctx.next()

    const program = getProgram(ctx)
    const blocks = getBlocks(ctx)
    matchExpression(node.expression, program, blocks)
}
