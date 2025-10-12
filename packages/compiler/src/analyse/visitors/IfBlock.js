import * as is from '../../checkers.js'
import { matchExpression } from '../../exp-matcher.js'
import { getBlocks, getProgram } from '../context.js'

export function IfBlock(node, ctx) {
    ctx.next()

    const program = getProgram(ctx)
    const blocks = getBlocks(ctx)
    matchExpression(node.test, program, blocks)
    
    const hasElseif = node.alternate?.nodes.some(is.ifBlock) ?? false

    node.metadata ??= {}
    node.metadata.hasElseif = hasElseif
}
