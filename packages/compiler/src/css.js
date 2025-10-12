export function match(element, stylesheet) {
    for (const rule of stylesheet.children) {
        if (matchSelectorList(element, rule.prelude)) return true
    }
    return false
}

function matchSelectorList(element, selectorList) {
    if (selectorList) {
        for (const selector of selectorList.children) {
            if (matchSelector(element, selector)) return true
        }
    }
    return false
}

function matchSelector(element, selector) {
    let selectors = []
    for (const child of selector.children) {
        switch (child.type) {
            case 'TypeSelector':
            case 'ClassSelector':
                selectors.push(child)
                break
            case 'PseudoClassSelector':
                if (matchSelectorList(element, child.children?.first)) return true
                selectors.push(child)
                break
            case 'Combinator':
                if (matchSelectors(element, selectors)) return true
                selectors = []
                break
        }
    }
    return matchSelectors(element, selectors)
}

function matchSelectors(element, selectors) {
    if (selectors.length === 0) return false

    for (const selector of selectors) {
        switch (selector.type) {
            case 'TypeSelector':
                if (selector.name !== element.name) return false
                break
            case 'ClassSelector':
                const classAtt = element.attributes.find((a) => a.name === 'class')?.value.data
                const classes = classAtt?.split(/\s+/)
                if (!classes?.includes(selector.name)) return false
                break
        }
    }
    return true
}

/**
 * Dead simple clx assuming class2 is always set
 * @param {string} class1
 * @param {string} class2
 * @returns {string}
 */
export function clx(class1, class2) {
    if (class1) return class1 + ' ' + class2
    return class2
}
