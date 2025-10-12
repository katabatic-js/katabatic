import * as is from '../../checkers.js'

export function ClassBody(node, ctx) {
    ctx.next()

    const hasConstructor = node.body.some(is.constructor)
    const hasConnectedCallbackMethod = node.body.some(is.connectedCallback)
    const hasDisconnectedCallbackMethod = node.body.some(is.disconnectedCallback)
    const hasGetAttribute = node.body.some(is.getAttribute)
    const hasAttributeChangedCallback = node.body.some(is.attributeChangedCallback)
    const hasObservedAttributes = node.body.some(is.observedAttributes)

    node.metadata ??= {}
    node.metadata.hasConstructor = hasConstructor
    node.metadata.hasConnectedCallbackMethod = hasConnectedCallbackMethod
    node.metadata.hasDisconnectedCallbackMethod = hasDisconnectedCallbackMethod
    node.metadata.hasGetAttribute = hasGetAttribute
    node.metadata.hasAttributeChangedCallback = hasAttributeChangedCallback
    node.metadata.hasObservedAttributes = hasObservedAttributes
}
