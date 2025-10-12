import * as b from '../../../builders.js'

export function SlotElement(node, ctx) {
    node = ctx.next() ?? node

    ctx.state.text.push('')
    ctx.state.expressions.push(b.member(b.id('slot'), b.id('default')))
}
