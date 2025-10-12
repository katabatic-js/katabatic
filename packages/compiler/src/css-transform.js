import { generate, parse } from 'css-tree'
import { walk } from 'zimmerframe'
import { Selector, CssTree } from './transform/visitors/Selector.js'

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
            ...CssTree
        }
    )

    return generate(selectorList)
}
