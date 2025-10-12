import * as b from '../../builders.js'

export function CustomElement(node, ctx) {
    const module = ctx.state.context.getModule(node.name)
    ctx.state.modules.add(module.name)

    let attributes = node.attributes
    if (node.metadata?.isScoped && !node.metadata?.hasClass) {
        attributes = [...attributes, b.attribute('class', '', { isScoped: true })]
    }

    ctx.state.template.push(`<${module.customElementName}`)
    for (const attribute of attributes) {
        ctx.visit(attribute, {...ctx.state, module})
    }
    ctx.state.template.push('>')
    ctx.visit(node.fragment)
    ctx.state.template.push(`</${module.customElementName}>`)
}
