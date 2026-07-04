export function hash(str) {
    let hash = 5381
    let i = str.length

    while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i)
    return (hash >>> 0).toString(36)
}

export function camelCase(str) {
    const result =  str.replace(/-([a-zA-Z0-9])/g, g => g[1].toUpperCase())
    return result.charAt(0).toUpperCase() + result.slice(1)
}