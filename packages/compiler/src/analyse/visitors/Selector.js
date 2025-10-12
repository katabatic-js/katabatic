import { matchSelector } from '../../css-matcher.js'
import { getTemplate } from '../context.js'

export function Selector(node, ctx) {
    node = CssTreeNodeFix(node, ctx)

    const template = getTemplate(ctx)
    const isUsed = matchSelector(node, template)

    node.metadata ??= {}
    node.metadata.isUsed = isUsed
}

export const CssTree = {
    StyleSheet: CssTreeNodeFix,
    SelectorList: CssTreeNodeFix,
    PseudoClassSelector: CssTreeNodeFix
}

function CssTreeNodeFix(node, ctx) {
    const children = node.children?.map((c) => ctx.visit(c)) ?? null
    return { ...node, children }
}
