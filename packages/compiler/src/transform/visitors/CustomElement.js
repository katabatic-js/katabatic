import * as b from '../../builders.js'
import { appendExpression, appendText } from '../../utils/template.js'

export function CustomElement(node, ctx) {
    let attributes = node.attributes
    if (node.metadata?.isScoped && !node.metadata?.hasClass) {
        attributes = [...attributes, b.attribute('class', '', { isScoped: true })]
    }

    if (node.metadata?.isModule) {
        const moduleId = b.id(`$Module_${node.metadata.index + 1}`)

        appendText(ctx.state.template, '<')
        appendExpression(ctx.state.template, b.$name(moduleId))
        for (const attribute of attributes) {
            ctx.visit(attribute, { ...ctx.state, moduleId })
        }
        appendText(ctx.state.template, '>')
        ctx.visit(node.fragment)
        appendText(ctx.state.template, '</')
        appendExpression(ctx.state.template, b.$name(moduleId))
        appendText(ctx.state.template, '>')
        return
    }

    appendText(ctx.state.template, `<${node.name}`)
    for (const attribute of attributes) {
        ctx.visit(attribute)
    }
    appendText(ctx.state.template, '>')
    ctx.visit(node.fragment)
    appendText(ctx.state.template, `</${node.name}>`)
}
