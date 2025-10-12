import { walk } from 'zimmerframe'
import { parse } from 'css-tree'

export function matchQuerySelector(query, template) {
    const stylesheet = parse(query + '{}')

    const selectorList = stylesheet.children.first.prelude

    let result = false
    for (const selector of selectorList.children) {
        result ||= matchSelector(selector, template)
    }
    return [result, selectorList]
}

export function matchSelector(selector, template) {
    let result = false

    let selectors = []
    for (const child of selector.children) {
        switch (child.type) {
            case 'Combinator':
                result ||= matchSelectors(selectors, template)
                selectors = []
                break
            default:
                selectors.push(child)
                break
        }
    }
    result ||= matchSelectors(selectors, template)
    return result
}

function matchSelectors(selectors, template) {
    if (selectors.length === 0) return false

    let result = false
    walk(template, undefined, {
        Element: (node, ctx) => {
            ctx.next()

            let scopedIdAttribute
            let scopedClassAttribute
            let scopedElement

            let classAttribute

            for (const selector of selectors) {
                switch (selector.type) {
                    case 'TypeSelector':
                        if (selector.name === node.name) {
                            classAttribute ??= node.attributes.find((a) => a.name === 'class')
                            scopedElement = node
                            scopedClassAttribute = classAttribute
                            break
                        }
                        return
                    case 'PseudoClassSelector':
                        classAttribute ??= node.attributes.find((a) => a.name === 'class')
                        scopedElement = node
                        scopedClassAttribute = classAttribute
                        break
                    case 'IdSelector':
                        const idAttribute = node.attributes.find((a) => a.name === 'id')
                        if (idAttribute?.value[0].data === selector.name) {
                            scopedIdAttribute = idAttribute
                            break
                        }
                        return
                    case 'ClassSelector':
                        classAttribute ??= node.attributes.find((a) => a.name === 'class')
                        const classes = classAttribute?.value[0].data.split(/\s+/)

                        if (classes?.includes(selector.name)) {
                            scopedClassAttribute = classAttribute
                            break
                        }
                        return
                }
            }

            if (scopedIdAttribute) {
                scopedIdAttribute.metadata ??= {}
                scopedIdAttribute.metadata.isScoped = true
            }
            if (scopedClassAttribute) {
                scopedClassAttribute.metadata ??= {}
                scopedClassAttribute.metadata.isScoped = true
            }
            if (scopedElement) {
                scopedElement.metadata ??= {}
                scopedElement.metadata.isScoped = true
            }

            result = true
        }
    })
    return result
}
