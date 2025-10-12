import { matchExpression } from "../../exp-matcher.js";
import { getBlocks, getProgram } from "../context.js";

export function ExpressionTag(node, ctx) {
    const program = getProgram(ctx)
    const blocks = getBlocks(ctx)

    matchExpression(node.expression, program, blocks)
}
