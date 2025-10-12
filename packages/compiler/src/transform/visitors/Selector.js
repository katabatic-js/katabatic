import * as b from '../../builders.js'

export function Selector(node, ctx) {
    node = CssTreeNodeFix(node, ctx)

    const children = []
    let unscoped = []
    for (const child of node.children) {
        switch (child.type) {
            case 'Combinator':
                scope()
                children.push(child)
                break
            default:
                unscoped.push(child)
                break
        }
    }
    scope()

    function scope() {
        if (unscoped.length > 0) {
            unscoped.push(b.classSelector(`drop-${ctx.state.context.hash}`))
            children.push(...unscoped)
            unscoped = []
        }
    }

    return { type: 'Selector', children }
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
