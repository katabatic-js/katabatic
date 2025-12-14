export function hash(str) {
    let hash = 5381
    let i = str.length

    while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i)
    return (hash >>> 0).toString(36)
}
