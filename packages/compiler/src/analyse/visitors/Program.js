import * as is from '../../checkers.js'

export function Program(node, ctx) {
    const modules = []
    const customElement = {
        properties: [],
        methods: ['getAttribute'],
        setters: [],
        private: {
            properties: [],
            methods: [],
            setters: []
        }
    }

    ctx.next({ ...ctx.state, modules, customElement })

    const hasDefineCustomElement = node.body.some(is.defineCustomElement)

    node.metadata ??= {}
    node.metadata.hasDefineCustomElement = hasDefineCustomElement
    node.metadata.modules = modules
    node.metadata.customElement = customElement
}
