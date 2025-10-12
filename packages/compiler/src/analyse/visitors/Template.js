import * as is from '../../checkers.js'

export function Template(node, ctx) {
    ctx.next()

    const isStatic = node.attributes.some(is.staticAttribute)
    const shadowRootMode = node.attributes.find(is.shadowRootModeAttribute)?.value[0]?.data

    node.metadata ??= {}
    node.metadata.shadowRootMode = shadowRootMode

    ctx.state.isStatic = isStatic
}

