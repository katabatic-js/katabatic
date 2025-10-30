import * as b from '../../builders.js'
import { appendText } from '../../utils/template.js'
import { nextElementId, pathStmt } from '../context.js'

export function IfBlock(node, ctx) {
    function branchStmt(node, hasElseif = false) {
        if (node) {
            const template = { text: [''], expressions: [] }
            const init = { elem: [], text: [] }
            const effects = []
            const handlers = []
            const blocks = []

            ctx.visit(node, { ...ctx.state, template, init, effects, handlers, blocks })

            if (!hasElseif) {
                const stmts1 = [
                    b.declaration('template', b.createElement('template')),
                    b.assignment(b.innerHTML('template'), b.template(template))
                ]
                const stmts2 = [...init.elem, ...init.text, ...effects, ...handlers, ...blocks]
                const stmt3 = b.insertBefore('anchor', b.member('template', 'content'))

                return [...stmts1, ...stmts2, stmt3]
            }
            return blocks
        }
    }

    const testStmt = ctx.visit(node.test)
    const consequentStmt = branchStmt(node.consequent)
    const alternateStmt = branchStmt(node.alternate, node.metadata?.hasElseif)

    if (!node.elseif) {
        const anchorId = nextElementId(ctx)
        const anchorStmt = b.declaration(anchorId, pathStmt(ctx, node))
        const blockStmt = b.ifBlock(anchorId, testStmt, consequentStmt, alternateStmt)

        ctx.state.init.elem.push(anchorStmt)
        ctx.state.blocks.push(blockStmt)
        appendText(ctx.state.template, '<!-- -->')
    } else {
        const blockStmt = b.ifBlock(b.id('anchor'), testStmt, consequentStmt, alternateStmt)
        ctx.state.blocks.push(blockStmt)
    }
}
