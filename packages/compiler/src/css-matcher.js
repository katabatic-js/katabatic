import { walk } from 'zimmerframe'
import { parse } from 'css-tree'

export function matchQuerySelector(query, template) {
    const stylesheet = parse(query + '{}')
    const selectorList = stylesheet.children.first.prelude

    let match = false
    for (const selector of selectorList.children) {
        match = matchSelector(selector, template) || match
    }
    return [match, selectorList]
}

export function matchSelector(selector, template) {
    let match = false
    let selectors = []

    for (const child of selector.children) {
        switch (child.type) {
            case 'Combinator':
                match = matchSelectors(selectors, template) || match
                selectors = []
                break
            default:
                selectors.push(child)
                break
        }
    }

    match = matchSelectors(selectors, template) || match
    return match
}

function matchSelectors(selectors, template) {
    if (selectors.length === 0) return false
    if (!template) return false

    let match = false

    function Visitor(node, ctx) {
        ctx.next()

        const idAttribute = node.attributes.find((a) => a.name === 'id')
        const classAttribute = node.attributes.find((a) => a.name === 'class')

        let _match = true
        let isElementScoped = false
        let isClassAttributeScoped = false
        let isIdAttributeScoped = false

        for (const selector of selectors) {
            switch (selector.type) {
                case 'TypeSelector':
                    _match &&= selector.name === node.name
                    isElementScoped = true
                    isClassAttributeScoped = true
                    break
                case 'PseudoClassSelector':
                    _match &&= selector.name !== 'host'
                    isElementScoped = true
                    isClassAttributeScoped = true
                    break
                case 'IdSelector':
                    _match &&= idAttribute?.value[0].data === selector.name
                    isIdAttributeScoped = true
                    break
                case 'ClassSelector':
                    const expression = classAttribute?.value[0].expression
                    const classes = classAttribute?.value[0].data?.split(/\s+/)

                    _match &&= expression || classes?.includes(selector.name)
                    isClassAttributeScoped = true
                    break
            }

            if (!_match) break
        }
        
        if (_match) {
            node.metadata ??= {}
            node.metadata.isScoped ||= isElementScoped
            if (idAttribute) {
                idAttribute.metadata ??= {}
                idAttribute.metadata.isScoped ||= isIdAttributeScoped
            }
            if (classAttribute) {
                classAttribute.metadata ??= {}
                classAttribute.metadata.isScoped ||= isClassAttributeScoped
            }
        }
        match ||= _match
    }

    walk(template, undefined, {
        Element: Visitor,
        CustomElement: Visitor
    })

    return match
}
