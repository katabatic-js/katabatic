export function appendText(template, value) {
    template.text[template.text.length - 1] += value
}
export function appendExpression(template, value) {
    template.expressions.push(value)
    template.text.push('')
}
