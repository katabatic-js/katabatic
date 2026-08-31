import * as b from '../../builders.js'
import { clx } from '../../css.js'
import { appendText, hasExpression, isEmpty } from '../../utils/template.js'

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
        ctx.visit(val, { ...ctx.state, template, pretty: false })
    }

    if (node.name === ':in' || node.name === ':out' || node.name === ':animate') {
        const elementId = ctx.state.getElementId()
        const expression = template.expressions[0]
        const direction = node.name === ':animate' ? 'both' : node.name.slice(1)
        const stmt = b.$animate(direction, {
            ...expression,
            arguments: [elementId, expression.arguments[0] ?? b.object(), b.id('o')]
        })
        ctx.state.animates.push(stmt)
        return
    }

    if (node.name === ':use') {
        const elementId = ctx.state.getElementId()
        const expression = template.expressions[0]
        const bindExpression = {
            ...expression,
            arguments: [elementId, b.call('opts', expression.arguments[0])]
        }
        const stmt = b.$bind(elementId, bindExpression)
        ctx.state.binds.push(stmt)
        return
    }

    if (node.name.startsWith(':on')) {
        const elementId = ctx.state.getElementId()
        const expression = template.expressions[0]
        const event = node.name.slice(3)
        const stmt = b.addEventListener(b.$getBinding(elementId), event, [expression], {
            optional: true
        })
        ctx.state.eventListeners.push(stmt)
        return
    }

    if (node.name.startsWith(':')) {
        const elementId = ctx.state.getElementId()
        const property = node.name.slice(1)
        const stmt = b.$effect([
            b.assignment(b.member(b.$getBinding(elementId), property), b.template(template))
        ])
        ctx.state.effects.push(stmt)
        return
    }

    if (node.name.startsWith('on')) {
        const elementId = ctx.state.getElementId()
        const expression = template.expressions[0]
        const event = node.name.slice(2)
        const stmt = b.addEventListener(elementId, event, [expression])
        ctx.state.eventListeners.push(stmt)
        return
    }

    if (hasExpression(template)) {
        const elementId = ctx.state.getElementId()
        const moduleId = ctx.state.getModuleId?.()

        const setStmt = moduleId
            ? b.$set(moduleId, elementId, b.literal(node.name), b.template(template))
            : b.setAttribute(elementId, b.literal(node.name), b.template(template))
        const stmt = b.$effect([setStmt])
        ctx.state.effects.push(stmt)
        return
    }

    if (isEmpty(template)) {
        appendText(ctx.state.template, ` ${node.name}`)
    } else {
        appendText(ctx.state.template, ` ${node.name}="${template.text[0]}"`)
    }
}
