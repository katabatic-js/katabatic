export function compileHtmlIndex(source, context) {
    const template = '`' + source.replace('%katabatic.body%', '${slot.body}') + '`'

    return {
        ...context,
        ...printIndex({ template })
    }
}

function printIndex({ template }) {
    return {
        code: `
export function renderIndex(slot) {
    return ${template}
}
    `
    }
}
