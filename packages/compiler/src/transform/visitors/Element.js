import * as b from '../../builders.js'
import { appendText } from '../../utils/template.js'
import { nextElementId, pathStmt } from '../context.js'

export function Element(node, ctx) {
    let attributes = node.attributes
    if (node.metadata?.isScoped && !node.metadata?.hasClass) {
        attributes = [...attributes, b.attribute('class', '', { isScoped: true })]
    }

    let elementId
    if (node.metadata?.hasExpressionAttribute) {
        elementId = nextElementId(ctx)
        const stmt = b.declaration(elementId, pathStmt(ctx, node))
        ctx.state.init.elem.push(stmt)
    }

    appendText(ctx.state.template, `<${node.name}`)
    for (const attribute of attributes) {
        ctx.visit(attribute, { ...ctx.state, getElementId: () => elementId })
    }
    if (node.metadata?.isVoid) {
        appendText(ctx.state.template, '/>')
    } else {
        appendText(ctx.state.template, '>')
        ctx.visit(node.fragment, { ...ctx.state, getElementId: () => elementId })
        appendText(ctx.state.template, `</${node.name}>`)
    }
}
