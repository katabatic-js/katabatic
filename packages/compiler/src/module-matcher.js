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
        }
    })
    return result
}
