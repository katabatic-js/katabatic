import * as b from '../../builders.js'
import { appendText } from '../../utils/template.js'

export function Element(node, ctx) {
    let attributes = node.attributes
    if (node.metadata?.isScoped && !node.metadata?.hasClass) {
        attributes = [...attributes, b.attribute('class', '', { isScoped: true })]
    }

    appendText(ctx.state.template, `<${node.name}`)
    for (const attribute of attributes) {
        ctx.visit(attribute)
    }
    appendText(ctx.state.template, '>')
    ctx.visit(node.fragment)
    appendText(ctx.state.template, `</${node.name}>`)
}
