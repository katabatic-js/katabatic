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

export function pathStmt(ctx, node) {
    const subPath = []

    for (const node of ctx.path.toReversed()) {
        if (node.type === 'IfBlock' || node.type === 'EachBlock' || node.type === 'Template') break
        subPath.unshift(node)
    }

    if (node) {
        subPath.push(node)
    }

    let stmt = b.member('template', 'content')
    let fragment
    for (const node of subPath) {
        switch (node.type) {
            case 'Fragment':
                fragment = node
                break
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
    let position = 0

    const nodes = fragment.nodes
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === node) break

        if (
            (nodes[i].type === 'ExpressionTag' || nodes[i].type === 'Text') &&
            (nodes[i - 1]?.type === 'ExpressionTag' || nodes[i - 1]?.type === 'Text')
        ) {
            // Text and ExpressionTag siblings are collapsed in one node in the html template
            continue
        }

        position++
    }
    return position
}

export function getElement(ctx) {
    return ctx.path.at(-1)
}


export function getProgram(ctx) {
    return ctx.path[0]
}