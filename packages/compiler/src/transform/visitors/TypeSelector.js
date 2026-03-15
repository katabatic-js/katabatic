export function TypeSelector(node) {
    if (node.metadata?.isModule) {
        const name = `$Module_${node.metadata.index + 1}`
        return { ...node, name }
    }
}
