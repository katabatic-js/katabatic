import * as b from '../../builders.js'

export function Element(node, ctx) {
    let attributes = node.attributes
    if (node.metadata?.isScoped && !node.metadata?.hasClass) {
        attributes = [...attributes, b.attribute('class', '', { isScoped: true })]
    }

    ctx.state.template.push(`<${node.name}`)
    for (const attribute of attributes) {
        ctx.visit(attribute)
    }
    ctx.state.template.push('>')
    ctx.visit(node.fragment)
    ctx.state.template.push(`</${node.name}>`)
}
