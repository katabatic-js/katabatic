import * as b from '../../builders.js'
import { getTemplate } from '../context.js'

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
            case 'PseudoClassSelector':
                if (child.name === 'host') {
                    const template = getTemplate(ctx)

                    if (!template.metadata?.shadowRootMode) {
                        children.push({
                            type: 'TypeSelector',
                            name:
                                template.metadata?.customElementName ??
                                ctx.state.context.customElementName
                        })
                    } else {
                        children.push(child)
                    }
                    break
                }
            default:
                unscoped.push(child)
                break
        }
    }
    scope()

    function scope() {
        if (unscoped.length > 0) {
            unscoped.push(b.classSelector(`ktb-${ctx.state.context.hash}`))
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

export function CssTreeNodeFix(node, ctx) {
    const children = node.children?.map((c) => ctx.visit(c)) ?? null
    return { ...node, children }
}
