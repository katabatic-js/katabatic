import * as is from '../../checkers.js'
import { matchQuerySelector } from '../../css-matcher.js'
import { matchElementById } from '../../id-matcher.js'
import { getTemplate } from '../context.js'

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
        const [isScoped, selectorList] = matchQuerySelector(selector, template)

        node.metadata ??= {}
        node.metadata.isQuerySelector= true
        node.metadata.isScoped = isScoped
        node.metadata.selectorList = selectorList
        return
    }
}
