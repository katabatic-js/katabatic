import * as is from '../../checkers.js'
import { matchQuerySelector } from '../../css-matcher.js'
import { matchQuerySelector as matchModuleQuerySelector } from '../../module-matcher.js'
import { matchElementById } from '../../id-matcher.js'
import { getProgram, getTemplate } from '../context.js'

export function CallExpression(node, ctx) {
    ctx.next()

    if (is.getElementById(node)) {
        const id = node.arguments[0].value
        const template = getTemplate(ctx)
        const isScoped = matchElementById(id, template)

        node.metadata ??= {}
        node.metadata.isGetElementById = true
        node.metadata.isScoped = isScoped
        return
    }

    if (is.querySelector(node)) {
        const selector = node.arguments[0].value
        const template = getTemplate(ctx)
        let [isScoped, selectorList] = matchQuerySelector(selector, template)
        isScoped = matchModuleQuerySelector(selectorList, ctx.state.modules) || isScoped

        node.metadata ??= {}
        node.metadata.isQuerySelector = true
        node.metadata.isScoped = isScoped
        node.metadata.selectorList = selectorList
        return
    }

    if (is.defineCustomElement(node)) {
        const template = getTemplate(ctx)
        const name = node.arguments[0].value

        template.metadata ??= {}
        template.metadata.customElementName = name

        ctx.state.customElement.name = name
        return
    }
}
