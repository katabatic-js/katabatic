import * as b from '../../builders.js'
import { clx } from '../../css.js'
import { appendText, hasExpression } from '../../utils/template.js'

export function Attribute(node, ctx) {
    let value = node.value
    if (node.name === 'id' && node.metadata?.isScoped) {
        if (value[0].type === 'Text') {
            value = [b.text(`${value[0].data}-${ctx.state.context.hash}`)]
        } else {
            value = [...value, b.text(`-${ctx.state.context.hash}`)]
        }
    }
    if (node.name === 'class' && node.metadata?.isScoped) {
        if (value[0].type === 'Text') {
            value = [b.text(clx(value[0].data, `ktb-${ctx.state.context.hash}`))]
        } else {
            value = [...value, b.text(` ktb-${ctx.state.context.hash}`)]
        }
    }

    const template = { text: [''], expressions: [] }
    for (const val of value) {
        ctx.visit(val, { ...ctx.state, template })
    }

    if (hasExpression(template)) {
        // expression attribute
        const elementId = ctx.state.getElementId()
        const moduleId = ctx.state.getModuleId?.()
        const bindingId = ctx.state.getBindingId?.()

        if (node.name === 'bind') {
            // binding handled in element visitor
        } else if (node.name === 'in' || node.name === 'out' || node.name === 'animate') {
            const direction = node.name === 'animate' ? 'both' : node.name
            const animateExpression = template.expressions[0]
            const stmt = b.$animate(direction, {
                ...animateExpression,
                arguments: [elementId, animateExpression.arguments[0] ?? b.object(), b.id('o')]
            })
            ctx.state.animates.push(stmt)
        } else if (node.name.startsWith('on')) {
            const stmt = b.assignment(
                b.member(elementId, node.name),
                b.eventListener(template.expressions[0])
            )
            ctx.state.handlers.push(stmt)
        } else if (moduleId) {
            const stmt = b.$effect([
                b.$set(moduleId, elementId, node.name, template.expressions[0])
            ])
            ctx.state.effects.push(stmt)
        } else if (bindingId) {
            const stmt = b.$effect([
                b.logical(
                    '||',
                    b.$setBindingProp(bindingId, node.name, template.expressions[0]),
                    b.setAttribute(elementId, b.literal(node.name), template.expressions[0])
                )
            ])
            ctx.state.effects.push(stmt)

            const stmt2 = b.$getBindingProp(
                bindingId,
                node.name,
                b.assignment(template.expressions[0], b.id('v'))
            )
            ctx.state.changed.push(stmt2)
        } else {
            const stmt = b.$effect([
                b.setAttribute(elementId, b.literal(node.name), template.expressions[0])
            ])
            ctx.state.effects.push(stmt)
        }
    } else {
        appendText(ctx.state.template, ` ${node.name}="${template.text[0] ?? 'true'}"`)
    }
}
