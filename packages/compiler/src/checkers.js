//
// advanced checkers
//

export function thisMember(node) {
    return node.type === 'MemberExpression' && node.object.type === 'ThisExpression'
}

export function privateId(node) {
    return node.type === 'PrivateIdentifier'
}

export function customElements(node) {
    return node.type === 'Identifier' && node.name === 'customElements'
}

export function define(node) {
    return node.type === 'Identifier' && node.name === 'define'
}

export function getElementById(node) {
    return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'document' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'getElementById'
    )
}

export function querySelector(node) {
    return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'querySelector'
    )
}

export function defineCustomElement(node) {
    if (node.type === 'ExpressionStatement') {
        node = node.expression
    }

    return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'customElements' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'define'
    )
}

export function constructor(node) {
    return node.type === 'MethodDefinition' && node.kind === 'constructor'
}

export function connectedCallback(node) {
    return node.type === 'MethodDefinition' && node.key.name === 'connectedCallback'
}

export function disconnectedCallback(node) {
    return node.type === 'MethodDefinition' && node.key.name === 'disconnectedCallback'
}

export function getAttribute(node) {
    return node.type === 'MethodDefinition' && node.key.name === 'getAttribute'
}

export function attributeChangedCallback(node) {
    return node.type === 'MethodDefinition' && node.key.name === 'attributeChangedCallback'
}

export function observedAttributes(node) {
    return (
        node.type === 'PropertyDefinition' &&
        node.key.name === 'observedAttributes' &&
        node.static === true
    )
}

export function classAttribute(node, withExpressionTag) {
    let result = node.type === 'Attribute' && node.name === 'class'
    if (withExpressionTag === true) {
        result &&= node.value[0]?.type === 'ExpressionTag'
    }
    return result
}

export function idAttribute(node, withExpressionTag) {
    let result = node.type === 'Attribute' && node.name === 'id'
    if (withExpressionTag === true) {
        result &&= node.value[0]?.type === 'ExpressionTag'
    }
    return result
}

export function staticAttribute(node) {
    return (
        node.type === 'Attribute' &&
        node.name === 'static' &&
        (node.value === true || (node.value[0]?.type === 'Text' && node.value[0]?.data === 'true'))
    )
}

export function shadowRootModeAttribute(node) {
    return node.type === 'Attribute' && node.name === 'shadowRootMode'
}

export function ifBlock(node) {
    return node.type === 'IfBlock'
}
