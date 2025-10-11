import * as b from '../../builders.js'

export function ClassBody(node, ctx) {
    node = ctx.next() ?? node

    const stmts1 = []
    const stmts2 = []
    if (!node.metadata?.hasConstructor) {
        const stmt = ctx.visit(b.constructor())
        stmts1.push(stmt)
    }

    if (!node.metadata?.hasConnectedCallbackMethod) {
        const stmt = ctx.visit(b.connectedCallback())
        stmts2.push(stmt)
    }

    if (!node.metadata?.hasDisconnectedCallbackMethod) {
        const stmt = ctx.visit(b.disconnectedCallback())
        stmts2.push(stmt)
    }

    if (!node.metadata?.hasAttributeChangedCallback && node.metadata?.hasObservedAttributes) {
        const stmt = ctx.visit(b.attributeChangedCallback())
        stmts2.push(stmt)
    }

    if (!node.metadata?.hasGetAttribute && node.metadata?.hasObservedAttributes) {
        const stmt = ctx.visit(b.getAttribute())
        stmts2.push(stmt)
    }

    if (stmts2.length >= 0) {
        return { ...node, body: [...stmts1, ...node.body, ...stmts2] }
    }
}
