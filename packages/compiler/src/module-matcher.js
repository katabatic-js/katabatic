import { walk } from 'zimmerframe'

export function matchModule(name, index, template) {
    let result = false
    walk(template, undefined, {
        CustomElement: (node, ctx) => {
            if (node.name === name) {
                node.metadata ??= {}
                node.metadata.isModule = true
                node.metadata.index = index

                result = true
            }
        },
        TypeSelector: (node, ctx) => {
            if (node.name === name) {
                node.metadata ??= {}
                node.metadata.isModule = true
                node.metadata.index = index

                result = true
            }
        },
        ...CssTree
    })
    return result
}

export const CssTree = {
    StyleSheet: CssTreeNodeFix,
    SelectorList: CssTreeNodeFix,
    Selector: CssTreeNodeFix,
    PseudoClassSelector: CssTreeNodeFix
}

function CssTreeNodeFix(node, ctx) {
    const children = node.children?.map((c) => ctx.visit(c)) ?? null
    return { ...node, children }
}
