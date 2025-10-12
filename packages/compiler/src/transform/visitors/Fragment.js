import * as b from '../../builders.js'
import { nextElementId, nextTextId, pathStmt } from '../context.js'

export function Fragment(node, ctx) {
    let text = []
    let expressions = []
    let index = 0
    let rootId

    for (const child of node.nodes) {
        switch (child.type) {
            case 'Text':
            case 'ExpressionTag':
                ctx.visit(child, { text, expressions, analysis: ctx.state.analysis })
                break
            default:
                finalize()
                ctx.visit(child)
                break
        }
    }
    finalize()

    function finalize() {
        if (text.length == 0) {
            // no text or expression
            index++
            return
        }

        if (expressions.length === 0) {
            // no expression
            ctx.state.template.push(text.join(''))

            text = []
            expressions = []
            index += 2
            return
        }

        // reactive
        if (!rootId) {
            rootId = nextElementId(ctx)
            const rootStmt = b.declaration(rootId, pathStmt(ctx))
            ctx.state.init.elem.push(rootStmt)
        }

        const textId = nextTextId(ctx)
        const textStmt = b.declaration(textId, b.sibling(b.child(rootId), index))
        ctx.state.init.text.push(textStmt)

        const effectStmt = b.$effect([
            b.assignment(b.textContent(textId), b.template(text, expressions))
        ])
        ctx.state.template.push(' ')
        ctx.state.effects.push(effectStmt)

        text = []
        expressions = []
        index += 2
    }
}
