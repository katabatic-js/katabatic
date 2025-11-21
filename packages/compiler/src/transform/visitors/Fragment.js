import * as b from '../../builders.js'
import { appendText, hasExpression, isEmpty } from '../../utils/template.js'
import { nextTextId, pathStmt } from '../context.js'

export function Fragment(node, ctx) {
    let template = { text: [''], expressions: [] }
    let textNode

    for (const child of node.nodes) {
        switch (child.type) {
            case 'Text':
            case 'ExpressionTag':
                textNode = child
                ctx.visit(child, { template, analysis: ctx.state.analysis })
                break
            default:
                finalize()
                ctx.visit(child)
                break
        }
    }
    finalize()

    function finalize() {
        if (hasExpression(template)) {
            const textId = nextTextId(ctx)
            const textStmt = b.declaration(textId, pathStmt(ctx, [node, textNode]))
            ctx.state.init.text.push(textStmt)

            const effectStmt = b.$effect([
                b.assignment(b.textContent(textId), b.template(template))
            ])
            ctx.state.effects.push(effectStmt)

            appendText(ctx.state.template, ' ')
            template = { text: [''], expressions: [] }
        } else if (!isEmpty(template)) {
            appendText(ctx.state.template, template.text.join(''))
            template = { text: [''], expressions: [] }
        }
    }
}
