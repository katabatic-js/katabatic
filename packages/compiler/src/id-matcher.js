import { walk } from 'zimmerframe'

export function matchElementById(id, template) {
    let result = false
    walk(template, undefined, {
        Attribute: (node, ctx) => {
            if (node.name === 'id' && node.value[0].data === id) {
                node.metadata ??= {}
                node.metadata.isScoped = true

                result = true
                ctx.stop()
            }
        }
    })
    return result
}
