export function append(array, value, options) {
    if (options?.spaceWord) {
        if (value && array.at(-1).at(-1) !== '"') {
            array[array.length - 1] += ' '
        }
    }

    array[array.length - 1] += value
}