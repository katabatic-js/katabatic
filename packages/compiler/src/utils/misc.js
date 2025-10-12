export function append(array, value, options) {
    if (options?.spaceWord) {
        if (value && array.at(-1).at(-1) !== '"') {
            array[array.length - 1] += ' '
        }
    }

    array[array.length - 1] += value
}

export function hash(str) {
    let hash = 5381
    let i = str.length

    while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i)
    return (hash >>> 0).toString(36)
}
