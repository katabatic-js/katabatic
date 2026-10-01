import { generate, parse } from 'css-tree'
import { walk } from 'zimmerframe'
import * as b from './builders.js'
import { Selector, CssTree } from './transform/visitors/Selector.js'
import { TypeSelector } from './transform/visitors/TypeSelector.js'
import { appendExpression, appendText } from './utils/template.js'

export function transformQuerySelector(selectorList, context) {
    if (typeof selectorList === 'string') {
        const stylesheet = parse(selectorList + '{}')
        selectorList = stylesheet.children.first.prelude
    }

    selectorList = walk(
        selectorList,
        { context },
        {
            Selector,
            TypeSelector,
            ...CssTree
        }
    )

    const css = generate(selectorList)
    const style = { text: [''], expressions: [] }

    // handle modules
    const tokens = css.split(/(\$Module_\d+)/)
    for (const token of tokens) {
        token.startsWith('$Module_')
            ? appendExpression(style, b.$name(token))
            : appendText(style, token)
    }

    return b.template(style)
}
