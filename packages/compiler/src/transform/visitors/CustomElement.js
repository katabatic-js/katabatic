import * as b from '../../builders.js'
import { appendExpression, appendText } from '../../utils/template.js'
import { nextElementId, pathStmt } from '../context.js'

export function CustomElement(node, ctx) {
    let attributes = node.attributes
    if (node.metadata?.isScoped && !node.metadata?.hasClass) {
        attributes = [...attributes, b.attribute('class', '', { isScoped: true })]
    }

    let elementId
    function getElementId() {
        if (!elementId) {
            elementId = nextElementId(ctx)
            const stmt = b.declaration(elementId, pathStmt(ctx))
            ctx.state.init.elem.push(stmt)
        }
        return elementId
    }

    if (node.metadata?.isModule) {
        const moduleId = b.id(`$Module_${node.metadata.index + 1}`)

        appendText(ctx.state.template, '<')
        appendExpression(ctx.state.template, b.$name(moduleId))
        for (const attribute of attributes) {
            ctx.visit(attribute, { ...ctx.state, getElementId, getModuleId: () => moduleId })
        }
        appendText(ctx.state.template, '>')
        ctx.visit(node.fragment)
        appendText(ctx.state.template, '</')
        appendExpression(ctx.state.template, b.$name(moduleId))
        appendText(ctx.state.template, '>')
    } else {
        appendText(ctx.state.template, `<${node.name}`)
        for (const attribute of attributes) {
            ctx.visit(attribute, { ...ctx.state, getElementId })
        }
        appendText(ctx.state.template, '>')
        ctx.visit(node.fragment)
        appendText(ctx.state.template, `</${node.name}>`)
    }
}
