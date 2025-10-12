export function Program(node, ctx) {
    const customElement = {
        className: [],
        properties: [],
        methods: ['getAttribute'],
        setters: [],
        private: {
            properties: [],
            methods: [],
            setters: []
        }
    }

    ctx.next({ ...ctx.state, customElement })

    node.metadata ??= {}
    node.metadata.customElement = {
        ...customElement,
        className: customElement.className[0] ?? false
    }
}
