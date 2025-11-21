export function appendText(template, value) {
    template.text[template.text.length - 1] += value
}
export function appendExpression(template, value) {
    template.expressions.push(value)
    template.text.push('')
}

export function hasExpression(template) {
    return template.expressions.length > 0
}

export function isEmpty(template) {
    return template.expressions.length == 0 && template.text.length == 1 && template.text[0] === ''
}
