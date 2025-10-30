import * as b from '../../builders.js'
import { appendText } from '../../utils/template.js'
import { nextElementId, pathStmt } from '../context.js'

export function EachBlock(node, ctx) {
    const template = { text: [''], expressions: [] }
    const init = { elem: [], text: [] }
    const effects = []
    const handlers = []
    const blocks = []

    ctx.visit(node.body, { ...ctx.state, template, init, effects, handlers, blocks })

    const stmts1 = [
        b.declaration('template', b.createElement('template')),
        b.assignment(b.innerHTML('template'), b.template(template))
    ]
    const stmts2 = [...init.elem, ...init.text, ...effects, ...handlers, ...blocks]
    const stmt3 = b.insertBefore('anchor', b.member('template', 'content'))

    const anchorId = nextElementId(ctx)
    const bodyStmt = [...stmts1, ...stmts2, stmt3]
    const expressionStmt = ctx.visit(node.expression)
    const anchorStmt = b.declaration(anchorId, pathStmt(ctx, node))
    const blockStmt = b.eachBlock(anchorId, expressionStmt, node.context, node.key, bodyStmt)

    ctx.state.init.elem.push(anchorStmt)
    ctx.state.blocks.push(blockStmt)
    appendText(ctx.state.template, '<!-- -->')
}
