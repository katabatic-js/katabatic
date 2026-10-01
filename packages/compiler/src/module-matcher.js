import { walk } from 'zimmerframe'

export function matchQuerySelector(selectorList, modules) {
    let match = false
    for (const selector of selectorList.children) {
        match = matchSelector(selector, modules) || match
    }
    return match
}

export function matchSelector(selector, modules) {
    modules = Array.isArray(modules) ? modules : modules?.metadata?.modules

    let match = false
    if (modules?.length > 0) {
        for (const child of selector.children) {
            switch (child.type) {
                case 'TypeSelector':
                    if (modules.includes(child.name)) {
                        match = true
                        child.metadata ??= {}
                        child.metadata.isModule = true
                        child.metadata.index = modules.indexOf(child.name)
                    }
                    break
            }
        }
    }
    return match
}

export function matchModule(name, index, template) {
    let result = false
    walk(template, undefined, {
        CustomElement: (node, ctx) => {
            if (node.name === name) {
                node.metadata ??= {}
                node.metadata.isModule = true
                node.metadata.index = index

                result = true
                ctx.stop()
            }
        }
    })
    return result
}
