import * as b from '../../builders.js'
import { appendText } from '../../utils/template.js'
import { nextElementId, nextTemplateId, pathStmt } from '../context.js'

export function EachBlock(node, ctx) {
    const template = { text: [''], expressions: [] }
    const init = { elem: [], text: [] }
    const binds = []
    const effects = []
    const animates = []
    const eventListeners = []
    const blocks = []

    ctx.visit(node.body, {
        ...ctx.state,
        template,
        init,
        binds,
        effects,
        animates,
        eventListeners,
        blocks
    })

    const templateId = nextTemplateId(ctx)
    const templateStmt = b.declaration(templateId, b.$$template(b.template(template)))
    ctx.state.templates.push(templateStmt)

    const stmt1 = b.declaration('fragment', b.importNode(b.member(b.call(templateId), 'content')))
    const stmts2 = [
        ...init.elem,
        ...init.text,
        ...binds,
        ...effects,
        ...animates,
        ...eventListeners,
        ...blocks
    ]
    const stmt3 = b.insertBefore('anchor', b.id('fragment'))

    const anchorId = nextElementId(ctx)
    const bodyStmt = [stmt1, ...stmts2, stmt3]
    const expressionStmt = ctx.visit(node.expression)
    const anchorStmt = b.declaration(anchorId, pathStmt(ctx, node))
    const blockStmt = b.eachBlock(anchorId, expressionStmt, node.context, node.key, bodyStmt)

    ctx.state.init.elem.push(anchorStmt)
    ctx.state.blocks.push(blockStmt)
    appendText(ctx.state.template, '<!-- -->')
}
