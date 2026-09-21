import * as b from '../../builders.js'
import { appendText } from '../../utils/template.js'
import { nextElementId, nextTemplateId, pathStmt } from '../context.js'

export function IfBlock(node, ctx) {
    function branchStmt(node, hasElseif = false) {
        if (node) {
            const template = { text: [''], expressions: [] }
            const init = { elem: [], text: [] }
            const binds = []
            const effects = []
            const animates = []
            const eventListeners = []
            const blocks = []

            ctx.visit(node, {
                ...ctx.state,
                template,
                init,
                binds,
                effects,
                animates,
                eventListeners,
                blocks
            })

            if (!hasElseif) {
                const templateId = nextTemplateId(ctx)
                const templateStmt = b.declaration(templateId, b.$$template(b.template(template)))
                ctx.state.templates.push(templateStmt)

                const stmt1 = b.declaration(
                    'fragment',
                    b.importNode(b.member(b.call(templateId), 'content'))
                )
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

                return [stmt1, ...stmts2, stmt3]
            }
            return [...init.elem, ...blocks]
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
        const anchorId = nextElementId(ctx)
        const anchorStmt = b.declaration(anchorId, b.insertBefore('anchor', b.createComment()))
        const blockStmt = b.ifBlock(anchorId, testStmt, consequentStmt, alternateStmt)

        ctx.state.init.elem.push(anchorStmt)
        ctx.state.blocks.push(blockStmt)
    }
}
