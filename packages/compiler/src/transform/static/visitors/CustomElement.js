import * as b from '../../../builders.js'
import { appendText, appendExpression } from '../../../utils/template.js'

export function CustomElement(node, ctx) {
    if (node.metadata?.isModule) {
        const dataStmt = b.object()
        for (const attribute of node.attributes) {
            const { name, value } = attribute

            const template = { text: [''], expressions: [] }
            for (const val of value) {
                ctx.visit(val, { ...ctx.state, template, pretty: false })
            }

            const stmt = b.property(name, b.template(template))
            dataStmt.properties.push(stmt)
        }

        const moduleId = b.id(`$Module_${node.metadata.index + 1}`)
        const loadStmt = b.call(b.member(moduleId, 'load'), [dataStmt], { optional: true })
        const renderStmt = b.call(b.member(moduleId, 'render'), [loadStmt])

        appendExpression(ctx.state.template, renderStmt)
    } else {
        appendText(ctx.state.template, `<${node.name}`)
        for (const attribute of node.attributes) {
            ctx.visit(attribute)
        }
        appendText(ctx.state.template, '>')
        ctx.visit(node.fragment)
        appendText(ctx.state.template, `</${node.name}>`)
    }
}
