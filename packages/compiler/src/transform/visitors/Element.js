import * as b from '../../builders.js'
import { appendText } from '../../utils/template.js'
import { nextBindingId, nextElementId, pathStmt } from '../context.js'

export function Element(node, ctx) {
    let attributes = node.attributes
    if (node.metadata?.isScoped && !node.metadata?.hasClass) {
        attributes = [...attributes, b.attribute('class', '', { isScoped: true })]
    }

    const changed = []

    let elementId
    function getElementId() {
        if (!elementId) {
            elementId = nextElementId(ctx)
            const stmt = b.declaration(elementId, pathStmt(ctx))
            ctx.state.init.elem.push(stmt)
        }
        return elementId
    }

    let bindingId
    function getBindingId() {
        if (!bindingId && node.metadata?.hasBinding) {
            bindingId = nextBindingId(ctx)
            const stmt = b.declaration(bindingId, {
                ...node.metadata?.bindExpression,
                arguments: [getElementId(), ...node.metadata?.bindExpression.arguments]
            })
            ctx.state.init.binding.push(stmt)
        }
        return bindingId
    }

    appendText(ctx.state.template, `<${node.name}`)
    for (const attribute of attributes) {
        ctx.visit(attribute, { ...ctx.state, getElementId, getBindingId, changed })
    }
    appendText(ctx.state.template, '>')
    ctx.visit(node.fragment, { ...ctx.state, getElementId })
    appendText(ctx.state.template, `</${node.name}>`)

    if (changed.length > 0) {
        const stmt = b.addEventListener(bindingId, 'changed', changed)
        ctx.state.handlers.push(stmt)
    }
}
