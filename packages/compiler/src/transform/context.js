import * as b from '../builders.js'

export function nextElementId(ctx) {
    return b.id(`elem_${ctx.state.init.elem.length + 1}`)
}

export function nextTextId(ctx) {
    return b.id(`text_${ctx.state.init.text.length + 1}`)
}

export function nextBlockId(ctx) {
    return b.id(`block_${ctx.state.blocks.length + 1}`)
}

export function nextBindingId(ctx) {
    return b.id(`binding_${ctx.state.init.binding.length + 1}`)
}

export function pathStmt(ctx, nodes) {
    const subPath = []

    for (const node of ctx.path.toReversed()) {
        if (node.type === 'IfBlock' || node.type === 'EachBlock' || node.type === 'Template') break
        subPath.unshift(node)
    }

    if (nodes) {
        subPath.push(...(Array.isArray(nodes) ? nodes : [nodes]))
    }

    let stmt = b.member('template', 'content')
    let fragment
    for (const node of subPath) {
        switch (node.type) {
            case 'Fragment':
                fragment = node
                break
            case 'Text':
            case 'ExpressionTag':
            case 'Element':
            case 'CustomElement':
            case 'IfBlock':
            case 'EachBlock':
                stmt = b.sibling(b.child(stmt), position(fragment, node))
                break
        }
    }
    return stmt
}

function position(fragment, node) {
    let position = -1

    const nodes = fragment.nodes
    for (let i = 0; i < nodes.length; i++) {
        if (
            (nodes[i].type === 'ExpressionTag' || nodes[i].type === 'Text') &&
            (nodes[i - 1]?.type === 'ExpressionTag' || nodes[i - 1]?.type === 'Text')
        ) {
            // Text and ExpressionTag siblings are collapsed in one node in the html template
            continue
        }

        position++
        if (nodes[i] === node) break
    }
    return position
}

export function getProgram(ctx) {
    return ctx.path[0]
}
