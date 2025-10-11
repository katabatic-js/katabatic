export function declaration(id, init, kind = 'const') {
    if (typeof id === 'string') {
        id = { type: 'Identifier', name: id }
    }

    return {
        type: 'VariableDeclaration',
        declarations: [
            {
                type: 'VariableDeclarator',
                id,
                init
            }
        ],
        kind
    }
}

export function literal(value) {
    return { type: 'Literal', value }
}

export function binary(operator, left, right) {
    return {
        type: 'BinaryExpression',
        operator,
        left,
        right
    }
}

export function template(text, expressions) {
    if (text.length === expressions.length) {
        // template literals must start and end with a text
        text.push('')
    }

    const quasis = text.map((raw) => ({
        type: 'TemplateElement',
        value: { raw }
    }))

    return {
        type: 'TemplateLiteral',
        quasis,
        expressions
    }
}

export function assignment(left, right, operator = '=') {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'AssignmentExpression',
            operator,
            left,
            right
        }
    }
}

export function member(object, property) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    if (typeof property === 'string') {
        property = { type: 'Identifier', name: property }
    }

    return {
        type: 'MemberExpression',
        object,
        property,
        computed: false,
        optional: false
    }
}

export function thisMember(property) {
    if (typeof property === 'string') {
        property = { type: 'Identifier', name: property }
    }

    return {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property,
        computed: false,
        optional: false
    }
}

export function arrowFunc(body) {
    return {
        type: 'ArrowFunctionExpression',
        id: null,
        expression: false,
        generator: false,
        async: false,
        params: [],
        body: {
            type: 'BlockStatement',
            body: [body]
        }
    }
}

export function importNamespace(local, source) {
    return {
        type: 'ImportDeclaration',
        specifiers: [
            {
                type: 'ImportNamespaceSpecifier',
                local
            }
        ],
        source: {
            type: 'Literal',
            value: source
        },
        attributes: []
    }
}

export function importSpecifier(name, source) {
    return {
        type: 'ImportDeclaration',
        specifiers: [
            {
                type: 'ImportSpecifier',
                imported: {
                    type: 'Identifier',
                    name
                },
                local: {
                    type: 'Identifier',
                    name
                }
            }
        ],
        source: {
            type: 'Literal',
            value: source
        },
        attributes: []
    }
}

export function property(key, value) {
    if (typeof key === 'string') {
        key = { type: 'Identifier', name: key }
    }

    return { type: 'Property', key, value }
}

export function object() {
    return { type: 'ObjectExpression', properties: [] }
}

export function id(name, isPrivate = false) {
    const type = isPrivate ? 'PrivateIdentifier' : 'Identifier'

    if (typeof name === 'string') return { type, name }
    return { ...name, type }
}

export function undefined() {
    return { type: 'Identifier', name: 'undefined' }
}

export function thisExp() {
    return { type: 'ThisExpression' }
}

export function exportDec(declaration) {
    return { type: 'ExportNamedDeclaration', declaration }
}

export function returnStmt(argument) {
    return { type: 'ReturnStatement', argument }
}

export function program(body = []) {
    return { type: 'Program', body }
}

export function func(id, body = []) {
    return {
        type: 'FunctionDeclaration',
        id,
        expression: false,
        generator: false,
        async: false,
        params: [],
        body: {
            type: 'BlockStatement',
            body
        }
    }
}

export function array(elements) {
    elements = elements.map((value) => ({ type: 'Literal', value }))

    return { type: 'ArrayExpression', elements }
}

export function call(callee) {
    return { type: 'CallExpression', callee, arguments: [], optional: false }
}

export function ifStmt(test, consequent, alternate) {
    return {
        type: 'IfStatement',
        test,
        consequent: {
            type: 'BlockStatement',
            body: consequent
        },
        alternate: alternate && {
            type: 'BlockStatement',
            body: alternate
        }
    }
}

export function forStmt(id, right, body) {
    return {
        type: 'ForOfStatement',
        await: false,
        left: {
            type: 'VariableDeclaration',
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id,
                    init: null
                }
            ],
            kind: 'const'
        },
        right,
        body: {
            type: 'BlockStatement',
            body
        }
    }
}

export function unary(operator, argument) {
    return {
        type: 'UnaryExpression',
        operator,
        prefix: true,
        argument
    }
}

//
// advanced builders
//

export function textContent(object) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    return {
        type: 'MemberExpression',
        object,
        property: {
            type: 'Identifier',
            name: 'textContent'
        },
        computed: false,
        optional: false
    }
}

export function innerHTML(object) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    return {
        type: 'MemberExpression',
        object,
        property: {
            type: 'Identifier',
            name: 'innerHTML'
        },
        computed: false,
        optional: false
    }
}

export function child(object) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    return {
        type: 'MemberExpression',
        object,
        property: {
            type: 'Identifier',
            name: 'firstChild'
        },
        computed: false,
        optional: false
    }
}

export function sibling(object, count) {
    let stmt = object
    while (count-- > 0) {
        stmt = {
            type: 'MemberExpression',
            object: stmt,
            property: {
                type: 'Identifier',
                name: 'nextSibling'
            },
            computed: false,
            optional: false
        }
    }
    return stmt
}

export function setAttribute(object, attribute, value) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    if (typeof attribute === 'string') {
        attribute = { type: 'Identifier', name: attribute }
    }

    if (typeof value === 'string') {
        value = { type: 'Identifier', name: value }
    }

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object,
            property: {
                type: 'Identifier',
                name: 'setAttribute'
            },
            computed: false,
            optional: false
        },
        arguments: [attribute, value],
        optional: false
    }
}

export function setProperty(object, property, right) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    if (typeof property === 'string') {
        property = { type: 'Identifier', name: property }
    }

    if (typeof right === 'string') {
        right = { type: 'Identifier', name: right }
    }

    return {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
            type: 'MemberExpression',
            object,
            property,
            computed: true,
            optional: false
        },
        right
    }
}

export function setSignalProperty(object, property, right) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    if (typeof property === 'string') {
        property = { type: 'Identifier', name: property }
    }

    if (typeof right === 'string') {
        right = { type: 'Identifier', name: right }
    }

    return {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object,
                property,
                computed: true,
                optional: false
            },
            property: { type: 'Identifier', name: 'value' },
            computed: false,
            optional: false
        },
        right
    }
}

export function includes(object, value) {
    if (typeof value === 'string') {
        value = { type: 'Identifier', name: value }
    }

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object,
            property: {
                type: 'Identifier',
                name: 'includes'
            },
            computed: false,
            optional: false
        },
        arguments: [value],
        optional: false
    }
}

export function defineCustomElement(elementName, className) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: 'customElements'
                },
                property: {
                    type: 'Identifier',
                    name: 'define'
                },
                computed: false,
                optional: false
            },
            arguments: [
                {
                    type: 'Literal',
                    value: elementName
                },
                {
                    type: 'Identifier',
                    name: className
                }
            ],
            optional: false
        }
    }
}

export function getCustomElement(value) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: 'customElements'
            },
            property: {
                type: 'Identifier',
                name: 'get'
            },
            computed: false,
            optional: false
        },
        arguments: [
            {
                type: 'Literal',
                value
            }
        ],
        optional: false
    }
}

export function $define(object) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object,
                property: {
                    type: 'Identifier',
                    name: '$define'
                },
                computed: false,
                optional: false
            },
            arguments: [],
            optional: false
        }
    }
}

export function $defineDecl(body) {
    return {
        type: 'ExportNamedDeclaration',
        declaration: {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: '$define'
            },
            expression: false,
            generator: false,
            async: false,
            params: [],
            body: {
                type: 'BlockStatement',
                body
            }
        },
        specifiers: [],
        source: null
    }
}

export function $set(object, nodeId, attribute, value) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object,
            property: {
                type: 'Identifier',
                name: '$set'
            },
            computed: false,
            optional: false
        },
        arguments: [
            nodeId,
            {
                type: 'Literal',
                value: attribute
            },
            value
        ],
        optional: false
    }
}

export function $setDecl(body) {
    return {
        type: 'ExportNamedDeclaration',
        declaration: {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: '$set'
            },
            expression: false,
            generator: false,
            async: false,
            params: [
                { type: 'Identifier', name: 'node' },
                { type: 'Identifier', name: 'attribute' },
                { type: 'Identifier', name: 'value' }
            ],
            body: {
                type: 'BlockStatement',
                body
            }
        },
        specifiers: [],
        source: null
    }
}

export function $$init(property, value) {
    const argumentsStmts = [
        { type: 'ThisExpression' },
        {
            type: 'Literal',
            value: property
        }
    ]

    if (value) {
        argumentsStmts.push(value)
    }

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'Identifier',
                name: '$$'
            },
            property: {
                type: 'Identifier',
                name: 'init'
            },
            computed: false,
            optional: false
        },
        arguments: argumentsStmts,
        optional: false
    }
}

export function $instrument(value) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: '$'
                },
                property: {
                    type: 'Identifier',
                    name: 'instrument'
                },
                computed: false,
                optional: false
            },
            computed: false,
            optional: false
        },

        arguments: [{ type: 'Literal', value }],
        optional: false
    }
}

export function createElement(value) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'document' },
            property: { type: 'Identifier', name: 'createElement' },
            computed: false,
            optional: false
        },
        arguments: [{ type: 'Literal', value }],
        optional: false
    }
}

export function $() {
    return {
        type: 'MemberExpression',
        object: {
            type: 'ThisExpression'
        },
        property: {
            type: 'Identifier',
            name: '$'
        },
        computed: false,
        optional: false
    }
}

export function $$() {
    return {
        type: 'CallExpression',
        callee: {
            type: 'Identifier',
            name: '$$'
        },
        arguments: [{ type: 'ThisExpression' }],
        optional: false
    }
}

export function shadow() {
    return {
        type: 'MemberExpression',
        object: {
            type: 'ThisExpression'
        },
        property: {
            type: 'Identifier',
            name: 'shadow'
        },
        computed: false,
        optional: false
    }
}

export function attachShadow(value = 'open') {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: {
                type: 'Identifier',
                name: 'attachShadow'
            },
            computed: false,
            optional: false
        },
        arguments: [
            {
                type: 'ObjectExpression',
                properties: [
                    {
                        type: 'Property',
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: {
                            type: 'Identifier',
                            name: 'mode'
                        },
                        value: {
                            type: 'Literal',
                            value
                        },
                        kind: 'init'
                    }
                ]
            }
        ],
        optional: false
    }
}

export function replaceChildren(object, node) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object,
            property: {
                type: 'Identifier',
                name: 'replaceChildren'
            },
            computed: false,
            optional: false
        },
        arguments: [node],
        optional: false
    }
}

export function insertAdjacentHTML(object, value) {
    if (typeof object === 'string') {
        object = { type: 'Identifier', name: object }
    }

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object,
            property: {
                type: 'Identifier',
                name: 'insertAdjacentHTML'
            },
            computed: false,
            optional: false
        },
        arguments: [
            {
                type: 'Literal',
                value: 'beforeend'
            },
            value
        ],
        optional: false
    }
}

export function insertBefore(node, insertNode) {
    if (typeof node === 'string') {
        node = { type: 'Identifier', name: node }
    }

    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'MemberExpression',
                    object: node,
                    property: {
                        type: 'Identifier',
                        name: 'parentNode'
                    },
                    computed: false,
                    optional: false
                },
                property: {
                    type: 'Identifier',
                    name: 'insertBefore'
                },
                computed: false,
                optional: false
            },
            arguments: [insertNode, node],
            optional: false
        }
    }
}

export function appendChild(object, node) {
    if (typeof node === 'string') {
        node = { type: 'Identifier', name: node }
    }

    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object,
                property: {
                    type: 'Identifier',
                    name: 'appendChild'
                },
                computed: false,
                optional: false
            },
            arguments: [node],
            optional: false
        }
    }
}

export function queueMicrotask(body) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'queueMicrotask' },
            arguments: [
                {
                    type: 'ArrowFunctionExpression',
                    id: null,
                    expression: false,
                    generator: false,
                    async: false,
                    params: [],
                    body: {
                        type: 'BlockStatement',
                        body
                    }
                }
            ],
            optional: false
        }
    }
}

export function connectedMoveCallback() {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'ThisExpression'
                },
                property: {
                    type: 'Identifier',
                    name: 'connectedMoveCallback'
                },
                computed: false,
                optional: false
            },
            arguments: [],
            optional: true
        }
    }
}

export function $dispose() {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object: {
                    type: 'ThisExpression'
                },
                property: {
                    type: 'Identifier',
                    name: '$'
                },
                computed: false,
                optional: false
            },
            property: {
                type: 'Identifier',
                name: 'dispose'
            },
            computed: false,
            optional: false
        },
        arguments: [],
        optional: false
    }
}

export function $lifecycle(value) {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object: {
                    type: 'ThisExpression'
                },
                property: {
                    type: 'Identifier',
                    name: '$'
                },
                computed: false,
                optional: false
            },
            property: {
                type: 'Identifier',
                name: 'lifecycle'
            },
            computed: false,
            optional: false
        },
        arguments: [{ type: 'Literal', value }],
        optional: false
    }
}

export function $trackAttribute(argumentsStmt) {
    argumentsStmt = [...argumentsStmt]
    argumentsStmt[0] ??= { type: 'Identifier', name: 'name' }

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object: {
                    type: 'ThisExpression'
                },
                property: {
                    type: 'Identifier',
                    name: '$'
                },
                computed: false,
                optional: false
            },
            property: {
                type: 'Identifier',
                name: 'trackAttribute'
            },
            computed: false,
            optional: false
        },
        arguments: argumentsStmt,
        optional: false
    }
}

export function $attributeChanged(argumentsStmt) {
    argumentsStmt = [...argumentsStmt]
    argumentsStmt[0] ??= { type: 'Identifier', name: 'name' }
    argumentsStmt[1] ??= { type: 'Identifier', name: 'value' }
    argumentsStmt[2] ??= { type: 'Identifier', name: 'nextValue' }

    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object: {
                    type: 'ThisExpression'
                },
                property: {
                    type: 'Identifier',
                    name: '$'
                },
                computed: false,
                optional: false
            },
            property: {
                type: 'Identifier',
                name: 'attributeChanged'
            },
            computed: false,
            optional: false
        },
        arguments: argumentsStmt,
        optional: false
    }
}

export function $effect(body) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: '$'
                },
                property: {
                    type: 'Identifier',
                    name: 'effect'
                },
                computed: false,
                optional: false
            },
            arguments: [
                {
                    type: 'ArrowFunctionExpression',
                    id: null,
                    expression: false,
                    generator: false,
                    async: false,
                    params: [],
                    body: {
                        type: 'BlockStatement',
                        body
                    }
                }
            ],
            optional: false
        }
    }
}

export function constructor(body = []) {
    return {
        type: 'MethodDefinition',
        static: false,
        computed: false,
        key: {
            type: 'Identifier',
            name: 'constructor'
        },
        kind: 'constructor',
        value: {
            type: 'FunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [],
            body: {
                type: 'BlockStatement',
                body: [
                    {
                        type: 'CallExpression',
                        callee: { type: 'Super' },
                        arguments: [],
                        optional: false
                    }
                ]
            }
        }
    }
}

export function connectedCallback(body = []) {
    return {
        type: 'MethodDefinition',
        static: false,
        computed: false,
        key: {
            type: 'Identifier',
            name: 'connectedCallback'
        },
        kind: 'method',
        value: {
            type: 'FunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [],
            body: {
                type: 'BlockStatement',
                body
            }
        }
    }
}

export function disconnectedCallback(body = []) {
    return {
        type: 'MethodDefinition',
        static: false,
        computed: false,
        key: {
            type: 'Identifier',
            name: 'disconnectedCallback'
        },
        kind: 'method',
        value: {
            type: 'FunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [],
            body: {
                type: 'BlockStatement',
                body
            }
        }
    }
}

export function attributeChangedCallback(body = []) {
    return {
        type: 'MethodDefinition',
        static: false,
        computed: false,
        key: {
            type: 'Identifier',
            name: 'attributeChangedCallback'
        },
        kind: 'method',
        value: {
            type: 'FunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [{ type: 'Identifier', name: 'name' }],
            body: {
                type: 'BlockStatement',
                body
            }
        }
    }
}

export function getAttribute() {
    return {
        type: 'MethodDefinition',
        static: false,
        computed: false,
        key: {
            type: 'Identifier',
            name: 'getAttribute'
        },
        kind: 'method',
        value: {
            type: 'FunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [{ type: 'Identifier', name: 'name' }],
            body: {
                type: 'BlockStatement',
                body: [
                    {
                        type: 'ReturnStatement',
                        argument: {
                            type: 'CallExpression',
                            callee: {
                                type: 'MemberExpression',
                                object: {
                                    type: 'Super'
                                },
                                property: {
                                    type: 'Identifier',
                                    name: 'getAttribute'
                                },
                                computed: false,
                                optional: false
                            },
                            arguments: [{ type: 'Identifier', name: 'name' }],
                            optional: false
                        }
                    }
                ]
            }
        }
    }
}

export function render(body = []) {
    return {
        type: 'FunctionDeclaration',
        id: {
            type: 'Identifier',
            name: 'render'
        },
        expression: false,
        generator: false,
        async: false,
        params: [
            {
                type: 'Identifier',
                name: 'data'
            },
            {
                type: 'Identifier',
                name: 'slot'
            }
        ],
        body: {
            type: 'BlockStatement',
            body
        }
    }
}

export function signal(id) {
    return {
        type: 'MemberExpression',
        object: {
            type: 'MemberExpression',
            object: {
                type: 'ThisExpression'
            },
            property: id,
            computed: false,
            optional: false
        },
        property: {
            type: 'Identifier',
            name: 'value'
        },
        computed: false,
        optional: false
    }
}

export function ifBlock(anchor, test, consequent, alternate) {
    const argumentsStmts = [
        anchor,
        {
            type: 'ArrowFunctionExpression',
            id: null,
            expression: true,
            generator: false,
            async: false,
            params: [],
            body: test
        },
        {
            type: 'ArrowFunctionExpression',
            id: null,
            expression: true,
            generator: false,
            async: false,
            params: [
                { type: 'Identifier', name: '$' },
                { type: 'Identifier', name: 'anchor' }
            ],
            body: { type: 'BlockStatement', body: consequent }
        }
    ]

    if (alternate) {
        argumentsStmts.push({
            type: 'ArrowFunctionExpression',
            id: null,
            expression: true,
            generator: false,
            async: false,
            params: [
                { type: 'Identifier', name: '$' },
                { type: 'Identifier', name: 'anchor' }
            ],
            body: { type: 'BlockStatement', body: alternate }
        })
    }

    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: '$'
                },
                property: {
                    type: 'Identifier',
                    name: 'ifBlock'
                },
                computed: false,
                optional: false
            },
            arguments: argumentsStmts,
            optional: false
        }
    }
}

export function eachBlock(anchor, expression, context, key, body) {
    let keyStmt

    if (key) {
        keyStmt = {
            type: 'ArrowFunctionExpression',
            id: null,
            expression: true,
            generator: false,
            async: false,
            params: [context],
            body: key
        }
    } else {
        keyStmt = {
            type: 'ArrowFunctionExpression',
            id: null,
            expression: true,
            generator: false,
            async: false,
            params: [
                { type: 'Identifier', name: 'v' },
                { type: 'Identifier', name: 'i' }
            ],
            body: { type: 'Identifier', name: 'i' }
        }
    }

    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: '$'
                },
                property: {
                    type: 'Identifier',
                    name: 'eachBlock'
                },
                computed: false,
                optional: false
            },
            arguments: [
                anchor,
                {
                    type: 'ArrowFunctionExpression',
                    id: null,
                    expression: true,
                    generator: false,
                    async: false,
                    params: [],
                    body: expression
                },
                keyStmt,
                {
                    type: 'ArrowFunctionExpression',
                    id: null,
                    expression: true,
                    generator: false,
                    async: false,
                    params: [
                        { type: 'Identifier', name: '$' },
                        { type: 'Identifier', name: 'anchor' },
                        context
                    ],
                    body: { type: 'BlockStatement', body }
                }
            ],
            optional: false
        }
    }
}

export function $block(body) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'MemberExpression',
                    object: {
                        type: 'ThisExpression'
                    },
                    property: {
                        type: 'Identifier',
                        name: '$'
                    },
                    computed: false,
                    optional: false
                },
                property: {
                    type: 'Identifier',
                    name: 'block'
                },
                computed: false,
                optional: false
            },
            arguments: [
                {
                    type: 'ArrowFunctionExpression',
                    id: null,
                    expression: true,
                    generator: false,
                    async: false,
                    params: [{ type: 'Identifier', name: '$' }],
                    body: { type: 'BlockStatement', body }
                }
            ],
            optional: false
        }
    }
}

export function $boundary(body) {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'MemberExpression',
                    object: {
                        type: 'ThisExpression'
                    },
                    property: {
                        type: 'Identifier',
                        name: '$'
                    },
                    computed: false,
                    optional: false
                },
                property: {
                    type: 'Identifier',
                    name: 'boundary'
                },
                computed: false,
                optional: false
            },
            arguments: [
                {
                    type: 'ArrowFunctionExpression',
                    id: null,
                    expression: true,
                    generator: false,
                    async: false,
                    params: [],
                    body: { type: 'BlockStatement', body }
                }
            ],
            optional: false
        }
    }
}

// html

export function attribute(name, value, metadata) {
    if (typeof value === 'string') {
        value = [{ type: 'Text', data: value }]
    }

    return { type: 'Attribute', name, value, metadata }
}

export function text(data) {
    return { type: 'Text', data }
}

// css

export function classSelector(name) {
    return { type: 'ClassSelector', name }
}
